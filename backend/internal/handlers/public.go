package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"lumio/backend/internal/repository"
)

func RegisterInvitationPublic(r *gin.Engine, pool *pgxpool.Pool, q *repository.Queries) {
	if pool == nil || q == nil {
		return
	}
	inv := NewInvitationsHandler(pool, q)
	r.GET("/api/i/:slug", inv.GetBySlug)
}