# Lumio — Project Conventions

> A wedding-invitation builder. Soft, romantic, made for sharing on WhatsApp.
> Brand spec lives in [`design.md`](./design.md) — read it before touching any UI.

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | Vercel-hosted |
| Styling | Tailwind v4 + `@theme` OKLCH tokens | All colours come from `design.md` |
| i18n | `next-intl` (ID default, EN opt-in) | Never hardcode user-facing copy |
| Auth | Supabase Auth | Go verifies JWT; FE uses `@supabase/supabase-js` |
| Storage | Supabase Storage | Signed-URL uploads |
| Backend | Go 1.26 + Gin | VPS-hosted |
| DB | Supabase Postgres | Direct connection, port 5432, `sslmode=require` |
| DB access | sqlc (type-safe) + `pgx/v5` | No GORM |
| Migrations | `golang-migrate` (CLI invoked by `cmd/migrate`) | One up, one down, never edited after merge |

## Repository layout

```
bubble-kaado/
├── design.md                 # Locked design system (source of truth for UI)
├── AGENTS.md                 # This file — conventions
├── .env.example              # Backend env template
├── backend/
│   ├── cmd/
│   │   ├── server/           # HTTP entrypoint
│   │   └── migrate/          # golang-migrate wrapper
│   ├── internal/
│   │   ├── config/           # env loading
│   │   ├── logger/           # slog wrapper
│   │   ├── middleware/       # requestid, logger, cors, recover, auth
│   │   ├── handlers/         # HTTP handlers
│   │   ├── repository/       # sqlc-generated queries
│   │   ├── supabase/         # JWT verifier (JWKS)
│   │   └── db/               # pgx pool
│   ├── migrations/           # *.up.sql + *.down.sql
│   ├── queries/              # sqlc input
│   ├── sqlc.yaml
│   └── go.mod
└── frontend/
    ├── src/
    │   ├── app/[locale]/     # next-intl routes
    │   ├── components/
    │   ├── i18n/
    │   ├── lib/
    │   └── messages/         # id.json + en.json
    └── ...
```

## Commands

**Use the Makefile.** `go run` caches the binary in `~/Library/Caches/go-build/` and `pkill -f "go run"` won't find it — leaving the port held.

| Task | Command |
|---|---|
| Start both servers | `make dev` (Ctrl-C stops; `make stop` for hard cleanup) |
| Backend only | `make dev-be` |
| Frontend only | `make dev-fe` |
| Stop everything | `make stop` |
| Rebuild Go binary | `make build` |
| Apply migrations | `cd backend && go run ./cmd/migrate up` |
| Regenerate sqlc | `cd backend && sqlc generate` |
| Create confirmed test user (no email sent, bypasses free-tier rate limit) | `cd backend && go run ./cmd/seed-user <email> <password> "[Full Name]"` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend typecheck | `cd frontend && npm run typecheck` |

## Environment variables

**Never commit `.env` files. Only `.env.example` placeholders.**

- `backend/.env` — `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `PORT`, `ENV`, `ALLOWED_ORIGINS`
- `frontend/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`

If you must print env values to debug, prefix the value with `***` (e.g. `***gH...`) — never the full string.

## Logging & observability

**Every Go service in this repo (current and future) must wire this exact
middleware chain, in this exact order, before any route registration:**

```go
r := gin.New()
r.Use(middleware.RequestID())
r.Use(middleware.RequestLogger(log))
r.Use(middleware.Recover(log))
r.Use(middleware.CORS(cfg.AllowedOrigins)) // or whatever's next for that service
```

`RequestLogger` must come **before** `Recover` (not after). Go's panic
unwinding jumps straight to the nearest `recover()`, skipping every stack
frame in between — including `RequestLogger`'s post-`c.Next()` logging code
if it were nested inside `Recover`. With `RequestLogger` outer, a panic still
produces a full request log line (status 500, path, duration, error) *in
addition to* `Recover`'s own stack-trace log. Getting this order backwards is
silent — nothing errors, panics just stop showing up in the request log.

**Why this matters:** `backend/internal/middleware/logger.go` is what turns
"something broke in prod" into a diagnosable line in the terminal, without
reproducing the request. Skipping it on a new service means that service's
failures are invisible until someone SSHes in and reproduces manually.

**What you get per request** (one structured `slog` line to stdout, via
`internal/logger`):

- `method`, `path`, `status`, `duration_ms`, `request_id`, `client_ip`,
  `bytes_in`, `bytes_out`, `user_agent`
- on 4xx/5xx: `error` — read back from the response body's `{"error": "..."}`
  field, and `internal_err` — anything a handler pushed via `c.Error(err)`
  (use this for the real underlying error when the client-facing message is
  deliberately generic, e.g. "internal server error" vs the actual DB error)

**This depends on a convention new handlers must keep:** every failure
response body must be `gin.H{"error": "<message>"}`. `RequestLogger` parses
that shape back out for the log line; a handler that returns errors some
other way (plain string, different key, no body) degrades to a raw-body
dump instead of a clean `error` field.

`request_id` is echoed back to the client via the `X-Request-ID` response
header — when a user reports "it failed," ask for that header's value (or
have the frontend surface it in its own error toast) and grep the backend
log for it to find the exact request.

Logs always go to stdout (`internal/logger`, `slog.NewTextHandler` in dev /
`slog.NewJSONHandler` in production) — never `fmt.Println`/`log.Println`
directly, and never write logs to a file. The process manager (systemd,
`nohup` + redirect, Docker) owns log capture and rotation, not the app.

## Design discipline (Hallmark)

`design.md` is the source of truth for any UI work. Before editing UI:

1. Read `design.md`.
2. Use the locked tokens (`--color-paper`, `--color-accent`, `--font-display`, etc.). No inline OKLCH/hex.
3. No invented metrics, logos, testimonials, or stock photos.
4. Mobile-verified at 320 / 375 / 414 / 768 px before considering a section "done."
5. All headings roman — no italic display.
6. Re-drawn chrome (fake browser bars, fake phone frames) is forbidden.

## Coding style

- Go: `gofmt`, `go vet ./...`, no `interface{}` (use `any`).
- TypeScript: strict mode, no `any` outside generated code.
- Both: meaningful names, no commented-out code, no dead branches.
- No comments unless they explain *why* (the system prompt forbids them by default).

## Commit / branch

- Branch names: `feat/<short>`, `fix/<short>`, `chore/<short>`.
- Commits: imperative, lowercase, no trailing period. Example: `feat: add quiet cover section`.
- Do not amend published commits. Do not force-push `main`.

## What to do when something is unclear

Ask. Don't invent.
