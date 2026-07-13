package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"lumio/backend/internal/middleware"
)

func RegisterMe(r *gin.Engine, pool *pgxpool.Pool) {
	r.GET("/api/me", func(c *gin.Context) {
		user := middleware.CurrentUser(c)
		if user == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
			return
		}
		if pool == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
			return
		}
		var displayName string
		err := pool.QueryRow(c.Request.Context(),
			`SELECT COALESCE(raw_user_meta_data->>'full_name', email) FROM auth.users WHERE id = $1`,
			user.ID,
		).Scan(&displayName)
		// Supabase exposes auth.users via the GoTrue schema; for now we surface what we have.
		if err != nil {
			displayName = user.Email
		}
		c.JSON(http.StatusOK, gin.H{
			"id":           user.ID,
			"email":        user.Email,
			"display_name": displayName,
			"server_time":  time.Now().UTC().Format(time.RFC3339),
		})
	})
}