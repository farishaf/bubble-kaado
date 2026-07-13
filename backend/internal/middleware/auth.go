package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"lumio/backend/internal/supabase"
)

const ctxUserKey = "auth_user"

type AuthUser struct {
	ID    string
	Email string
	Role  string
}

func RequireAuth(v *supabase.Verifier, log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "missing bearer token",
			})
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		claims, err := v.Verify(c.Request.Context(), token)
		if err != nil {
			log.Warn("auth verify failed", "err", err, "request_id", GetRequestID(c))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token",
			})
			return
		}
		c.Set(ctxUserKey, &AuthUser{
			ID:    claims.Sub,
			Email: claims.Email,
			Role:  claims.Role,
		})
		c.Next()
	}
}

func CurrentUser(c *gin.Context) *AuthUser {
	if v, ok := c.Get(ctxUserKey); ok {
		if u, ok := v.(*AuthUser); ok {
			return u
		}
	}
	return nil
}

func UserFromContext(ctx context.Context) *AuthUser {
	if u, ok := ctx.Value(ctxUserKey).(*AuthUser); ok {
		return u
	}
	return nil
}