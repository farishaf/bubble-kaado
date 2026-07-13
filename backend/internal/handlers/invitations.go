package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"lumio/backend/internal/middleware"
	"lumio/backend/internal/repository"
)

type InvitationsHandler struct {
	pool *pgxpool.Pool
	q    *repository.Queries
}

func NewInvitationsHandler(pool *pgxpool.Pool, q *repository.Queries) *InvitationsHandler {
	return &InvitationsHandler{pool: pool, q: q}
}

type createInvitationReq struct {
	TemplateSlug string                 `json:"template_slug"`
	Title        string                 `json:"title"`
	Slug         string                 `json:"slug"`
	Status       string                 `json:"status"`
	Sections     map[string]any         `json:"sections"`
	Data         map[string]any         `json:"data"`
}

type invitationResp struct {
	Slug     string `json:"slug"`
	URL      string `json:"url"`
	Status   string `json:"status"`
	Template string `json:"template_slug"`
}

var slugRE = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$`)

func (h *InvitationsHandler) Create(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}
	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}

	var req createInvitationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if req.TemplateSlug == "" || req.Title == "" || req.Slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "template_slug, title, and slug are required"})
		return
	}
	if !slugRE.MatchString(req.Slug) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "slug must be 3-62 chars, lowercase alphanumeric and hyphens"})
		return
	}
	if req.Status == "" {
		req.Status = "draft"
	}
	if req.Sections == nil {
		req.Sections = map[string]any{}
	}
	if req.Data == nil {
		req.Data = map[string]any{}
	}

	sectionsJSON, _ := json.Marshal(req.Sections)
	dataJSON, _ := json.Marshal(req.Data)

	ctx := c.Request.Context()
	card, err := h.q.CreateCard(ctx, repository.CreateCardParams{
		UserID:       userIDToUUID(user.ID),
		TemplateSlug: req.TemplateSlug,
		Title:        req.Title,
		Slug:         req.Slug,
		Status:       req.Status,
		Sections:     sectionsJSON,
		Data:         dataJSON,
	})
	if err != nil {
		if isUniqueViolation(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "slug already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed"})
		return
	}

	c.JSON(http.StatusCreated, invitationResp{
		Slug:     card.Slug,
		URL:      publicURL(c, card.Slug),
		Status:   card.Status,
		Template: card.TemplateSlug,
	})
}

type updateInvitationReq struct {
	Title string         `json:"title"`
	Data  map[string]any `json:"data"`
}

func (h *InvitationsHandler) Update(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}
	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req updateInvitationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if req.Title == "" || req.Data == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and data are required"})
		return
	}
	dataJSON, _ := json.Marshal(req.Data)
	card, err := h.q.UpdateCardData(c.Request.Context(), repository.UpdateCardDataParams{
		Slug:   c.Param("slug"),
		UserID: userIDToUUID(user.ID),
		Title:  req.Title,
		Data:   dataJSON,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, invitationResp{
		Slug:     card.Slug,
		URL:      publicURL(c, card.Slug),
		Status:   card.Status,
		Template: card.TemplateSlug,
	})
}

func (h *InvitationsHandler) ListMine(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}
	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	cards, err := h.q.ListCardsByUser(c.Request.Context(), userIDToUUID(user.ID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	out := make([]invitationResp, 0, len(cards))
	for _, card := range cards {
		out = append(out, invitationResp{
			Slug:     card.Slug,
			URL:      publicURL(c, card.Slug),
			Status:   card.Status,
			Template: card.TemplateSlug,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": out, "meta": gin.H{"total": len(out)}})
}

func (h *InvitationsHandler) GetBySlug(c *gin.Context) {
	if h.pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	slug := c.Param("slug")
	card, err := h.q.GetCardBySlug(c.Request.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "lookup failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"slug":          card.Slug,
		"template_slug": card.TemplateSlug,
		"title":         card.Title,
		"data":          json.RawMessage(card.Data),
		"sections":      json.RawMessage(card.Sections),
		"status":        card.Status,
		"created_at":    card.CreatedAt.Time.Format(time.RFC3339),
	})
}

func publicURL(c *gin.Context, slug string) string {
	scheme := "http"
	if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	host := c.Request.Host
	return scheme + "://" + host + "/i/" + slug
}

func isUniqueViolation(err error) bool {
	return err != nil && (containsAny(err.Error(), "23505", "duplicate key", "unique constraint"))
}

func containsAny(s string, needles ...string) bool {
	for _, n := range needles {
		if len(n) <= len(s) {
			for i := 0; i+len(n) <= len(s); i++ {
				if s[i:i+len(n)] == n {
					return true
				}
			}
		}
	}
	return false
}