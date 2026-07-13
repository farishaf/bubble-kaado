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
│   │   ├── middleware/       # requestid, cors, recover, auth
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
