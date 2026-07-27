-- name: CreateCard :one
INSERT INTO cards (user_id, template_slug, title, slug, status, sections, data)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, template_slug, title, slug, status, sections, data, access_type, created_at, updated_at;

-- name: GetCardBySlug :one
SELECT id, user_id, template_slug, title, slug, status, sections, data, access_type, created_at, updated_at
FROM cards
WHERE slug = $1 AND status != 'deleted'
LIMIT 1;

-- name: UpdateCardData :one
-- new_slug renames the card's public link; empty keeps the current slug.
UPDATE cards
SET title = sqlc.arg(title),
    data = sqlc.arg(data),
    slug = COALESCE(NULLIF(sqlc.arg(new_slug)::text, ''), slug)
WHERE slug = sqlc.arg(slug) AND user_id = sqlc.arg(user_id) AND status != 'deleted'
RETURNING id, user_id, template_slug, title, slug, status, sections, data, access_type, created_at, updated_at;

-- name: ListCardsByUser :many
SELECT id, user_id, template_slug, title, slug, status, access_type, created_at, updated_at
FROM cards
WHERE user_id = $1 AND status != 'deleted'
ORDER BY created_at DESC;