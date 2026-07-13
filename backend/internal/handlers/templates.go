package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Template is the wire shape returned by GET /api/templates.
// Mirrors the future `templates` table; populated in Phase 3.
type Template struct {
	ID           string `json:"id"`
	Slug         string `json:"slug"`
	Name         string `json:"name"`
	CategoryID   string `json:"category_id"`
	ThumbnailURL string `json:"thumbnail_url"`
	IsPremium    bool   `json:"is_premium"`
}

func RegisterTemplates(r *gin.Engine, pool *pgxpool.Pool) {
	r.GET("/api/templates", func(c *gin.Context) {
		if pool == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"data": []Template{},
			"meta": gin.H{"total": 0, "page": 1, "per_page": 20},
		})
	})
}