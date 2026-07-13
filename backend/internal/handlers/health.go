package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterHealth(r *gin.Engine, pool *pgxpool.Pool) {
	r.GET("/healthz", func(c *gin.Context) {
		dbStatus := "not configured"
		if pool != nil {
			ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
			defer cancel()
			if err := pool.Ping(ctx); err != nil {
				dbStatus = "down: " + err.Error()
			} else {
				dbStatus = "ok"
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"db":     dbStatus,
			"time":   time.Now().UTC().Format(time.RFC3339),
		})
	})
}