package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"lumio/backend/internal/config"
	"lumio/backend/internal/db"
	"lumio/backend/internal/handlers"
	"lumio/backend/internal/logger"
	"lumio/backend/internal/middleware"
	"lumio/backend/internal/repository"
	"lumio/backend/internal/supabase"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	log := logger.New(cfg.Env, cfg.LogLevel)
	slog.SetDefault(log)

	pool, err := db.NewPool(context.Background(), cfg.DatabaseURL, cfg.DBMaxConns, cfg.DBMinConns)
	if err != nil {
		if cfg.Env == "production" {
			log.Error("db connect failed", "err", err)
			os.Exit(1)
		}
		log.Warn("db unavailable — starting without DB; /healthz will report db=down", "err", err)
	} else {
		defer pool.Close()
		log.Info("db pool ready", "max", cfg.DBMaxConns, "min", cfg.DBMinConns)
	}

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(middleware.RequestID())
	r.Use(middleware.Recover(log))
	r.Use(middleware.CORS(cfg.AllowedOrigins))

	handlers.RegisterHealth(r, pool)
	handlers.RegisterTemplates(r, pool)
	handlers.RegisterMe(r, pool)

	jwksURL := strings.TrimRight(cfg.SupabaseURL, "/") + "/auth/v1/.well-known/jwks.json"
	verifier := supabase.NewVerifier(jwksURL, cfg.SupabaseURL)

	var q *repository.Queries
	if pool != nil {
		q = repository.New(pool)
		inv := handlers.NewInvitationsHandler(pool, q)
		auth := r.Group("/api", middleware.RequireAuth(verifier, log))
		auth.POST("/invitations", inv.Create)
		auth.GET("/invitations", inv.ListMine)
		auth.PUT("/invitations/:slug", inv.Update)
	}
	handlers.RegisterInvitationPublic(r, pool, q)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Info("server starting", "port", cfg.Port, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("listen failed", "err", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("shutting down")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error("shutdown failed", "err", err)
	}
}