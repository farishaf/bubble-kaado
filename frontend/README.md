# Lumio — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind v4 + next-intl.

## Scripts

| Task | Command |
|---|---|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Start | `npm start` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |

## Env

Copy `.env.example` → `.env.local` and fill in real values. `.env.local` is gitignored.

## Design system

Source of truth is `../design.md`. Tokens are mirrored into `src/app/globals.css` via Tailwind v4 `@theme`. Never inline OKLCH values in components.