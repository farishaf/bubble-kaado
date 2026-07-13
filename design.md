# Lumio — Locked Design System

> Source of truth for every UI surface in this project. All tokens below are the
> only colour, type, spacing, and motion values allowed in production code.
> If a value isn't here, it's wrong — add it here first, then reference it.

**Audience** — young Indonesian couples, 22–30, planning their first wedding, mobile-first, sharing on WhatsApp/Instagram, price-sensitive. **Bloom** product extends this to teens / young adults (16–22) sending personal flower-themed digital gifts.

**Use case** — browse templates → customise → share the `/i/:slug` URL. **Bloom** → send a digital bouquet via a single link (`/bloom/:slug`).

**Tone** — soft / romantic. Not corporate, not "modern SaaS." Refined, quiet, warm. Bloom stays intimate and hand-drawn — quiet, not bubbly.

**Genre / Macrostructure** — editorial hybrid (Quiet Cover → asymmetric Template Showcase → How it works → Testimonials → CTA → FAQ → single-line Footer). **Bloom** uses Letter macrostructure — fewer sections, content-led via floriography.

**Languages** — Indonesian (default) + English (opt-in via header toggle).

---

## Colour (OKLCH — locked)

Backgrounds are warm cream; text is warm near-black; accent is dusty rose. Every colour the UI uses must be one of these tokens. Inline OKLCH / hex / `rgb()` in components is forbidden.

```css
:root {
  /* Paper */
  --color-paper:        oklch(0.97 0.012  80);   /* page background */
  --color-paper-2:      oklch(0.94 0.015  80);   /* card / section surface */
  --color-paper-3:      oklch(0.91 0.014  78);   /* nested surface / hover */

  /* Ink */
  --color-ink:          oklch(0.22 0.015  60);   /* primary text */
  --color-ink-2:        oklch(0.45 0.012  60);   /* secondary text */
  --color-ink-3:        oklch(0.62 0.010  60);   /* tertiary / placeholder */

  /* Muted */
  --color-muted:        oklch(0.88 0.010  80);   /* borders, dividers */
  --color-muted-2:      oklch(0.92 0.010  80);   /* hairline borders */

  /* Accent */
  --color-accent:       oklch(0.68 0.100  15);   /* dusty rose — primary */
  --color-accent-2:     oklch(0.78 0.080  70);   /* muted amber — soft highlight */
  --color-accent-ink:   oklch(0.30 0.060  20);   /* text on accent backgrounds */

  /* Focus */
  --color-focus:        oklch(0.68 0.100  15);   /* uses accent — always visible */

  /* Semantic */
  --color-success:      oklch(0.72 0.110 150);
  --color-warning:      oklch(0.78 0.110  80);
  --color-danger:       oklch(0.62 0.180  25);
}
```

## Typography

Display: **Fraunces** (variable serif — soft, modern, romantic).
Body: **Plus Jakarta Sans** (humanist sans — covers ID + EN).
Mono: **JetBrains Mono** (only for code, slugs, IDs).

```css
--font-display: "Fraunces", ui-serif, Georgia, serif;
--font-body:    "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, monospace;
```

**Scale (4-pt baseline):** 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 / 80.
**Weights:** display 400/500/600, body 400/500, mono 400/500.
**Line-height:** display 1.05–1.15, body 1.55.
**Measure:** body 60–72ch max; long-form 64–68ch.

**Rules:**
- Headings and display type are always **roman** (`font-style: normal`). Italic headers are banned.
- Emphasis in headings comes from weight, the accent colour, or a drawn underline — never `<em>` italics.

## Spacing (4-pt scale)

`--space-1: 4px · --space-2: 8px · --space-3: 12px · --space-4: 16px · --space-5: 20px · --space-6: 24px · --space-8: 32px · --space-10: 40px · --space-12: 48px · --space-16: 64px · --space-20: 80px · --space-24: 96px · --space-32: 128px`

Vertical rhythm between sections: `var(--space-24)` desktop, `var(--space-16)` mobile.

## Radii

`--radius-sm: 6px · --radius-md: 10px · --radius-lg: 16px · --radius-xl: 24px · --radius-pill: 999px`

## Shadows

```css
--shadow-1: 0 1px 2px oklch(0.22 0.015 60 / 0.04);
--shadow-2: 0 4px 12px oklch(0.22 0.015 60 / 0.06);
--shadow-3: 0 12px 32px oklch(0.22 0.015 60 / 0.10);
```

## Motion (under 3 primitives)

| Name | What | Spec |
|---|---|---|
| `soft-fade` | Section fade-up on scroll into view | 320ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, 12px translateY → 0 |
| `lift-hover` | Card hover | 200ms ease-out, 4px translateY + shadow 1 → 2 |
| `press-press` | Button `:active` | 80ms ease-in, 1px translateY |

All motion is disabled when `prefers-reduced-motion: reduce` is set.

## Layout primitives

- **Container max-width** — prose 68ch, content 1120px, wide 1280px.
- **Section vertical rhythm** — `--space-24` desktop, `--space-16` mobile.
- **Grid** — 12-col on desktop, 6-col on tablet, 4-col on mobile. Image-bearing tracks use `minmax(0, 1fr)`, never bare `1fr`.
- **Mobile floor** — verified at 320 / 375 / 414 / 768 px. No horizontal scroll. Buttons, nav, and footer links never wrap to two lines.

## Voice

- **Verbs are short and concrete.** "Mulai" not "Mulai sekarang juga." "Simpan" not "Simpan undangan Anda."
- **No exclamation marks in product copy.**
- **No emoji.**
- **No "Ready to..." / "Let's..." / "Get started"** filler.
- **First-person plural ("kami") is forbidden.** Use "Lumio" or imperative.
- **Tone is warm but restrained.** Not bubbly, not corporate. Like a small wedding stationer who happens to ship software.

## Anti-patterns (banned)

- Invented metrics, customer counts, or testimonial quotes.
- Fake logos of brands that don't use the product.
- Stock photos of couples as if they were real customers.
- Fake browser/device chrome around screenshots.
- Italic display headings.
- 3-icon-card "How it works" pattern.
- Text-gradient rainbow effects.
- Emoji in product copy.
- Two-line clickable text in any language.
- Horizontal scroll on mobile.
- The 5-star rating badge.

## Section order (landing `/`)

1. **Quiet Cover** — display headline, one supporting line, primary CTA. No hero image. No fake screenshot.
2. **Template Showcase** — asymmetric 12-col grid, 4–6 templates above mobile fold (horizontal scroll on small screens), real screenshot or clearly-labelled placeholder.
3. **How it works** — three numbered steps (roman numerals), one line of body copy each. No icons.
4. **Testimonials** — three short quotes, attribution + wedding date, no headshots, no 5-star badges.
5. **CTA band** — single sentence, one button.
6. **FAQ** — accordion, 5–7 questions, ID + EN.
7. **Footer** — brand mark · two text links · "Made with care in Jakarta."

## Nav archetype

- `N5 Floating pill` — centred, soft, mobile collapses to a single chip → bottom sheet.
- **Default-away from N1a and Ft3** (the most-recognised AI fingerprints).

## Footer archetype

- `Ft5 Statement` — single line, brand mark, two text links, "Made with care in Jakarta." No 4-column link grid, no social row.

## Diversification log (`.hallmark/log.json`)

```json
[
  { "date": "2026-06-20", "macrostructure": "Editorial Showcase", "theme": "custom (warm-cream + dusty-rose)", "enrichment": "none — typography only", "brief": "Lumio · wedding invitation builder · v1" }
]
```

Future Hallmark runs in this project must read this log and pick a *different* macrostructure or theme axes (paper band · display style · accent hue).

---

## Kaado gift surfaces (addendum 2026-07-05)

Kaado (`/gift` editor, `/g/:template` player) is a personal-gift product like Bloom. The player is user-content: the sender picks one of four pastel themes, so the player draws only from these tokens (defined in `globals.css` under "Kaado gift", selected via `data-gift-theme`):

| Theme | `--gift-bg` | `--gift-card` | `--gift-soft` | `--gift-accent` | `--gift-accent-ink` |
|---|---|---|---|---|---|
| `rose` | `oklch(0.955 0.022 15)` | `oklch(0.99 0.008 15)` | `oklch(0.90 0.045 15)` | `oklch(0.68 0.100 15)` | `oklch(0.98 0.010 15)` |
| `ocean` | `oklch(0.955 0.018 230)` | `oklch(0.985 0.006 230)` | `oklch(0.89 0.045 230)` | `oklch(0.60 0.090 240)` | `oklch(0.98 0.008 230)` |
| `sunset` | `oklch(0.96 0.030 80)` | `oklch(0.99 0.010 85)` | `oklch(0.90 0.060 70)` | `oklch(0.70 0.115 55)` | `oklch(0.24 0.050 55)` |
| `lavender` | `oklch(0.955 0.022 300)` | `oklch(0.985 0.007 300)` | `oklch(0.89 0.048 300)` | `oklch(0.60 0.100 305)` | `oklch(0.98 0.008 300)` |

`--gift-ink` / `--gift-ink-2` alias the global ink tokens. Confetti palette: `gc0–gc5` (rose, amber, mint, sky, lilac, cream — values in `globals.css`). Vinyl disc: `oklch(0.25 0.01 60)` with grooves `oklch(0.35 0.01 60)`; mascot tear `oklch(0.78 0.08 230)`. Letter paper variants (`.gift-letter--ruled/--vintage`): vintage kraft `oklch(0.93 0.03 85)` with border `oklch(0.85 0.05 80)` and inset `oklch(0.95 0.025 85)`.

**Handwriting font (gift letters only):** `--font-hand: "Caveat", "Segoe Script", cursive` — allowed exclusively inside `.gift-letter`. Never for headings or product chrome.

Gift-player exceptions to the base rules: playful motion (bob, wobble, confetti) and uppercase display lines are allowed inside `/g/:template` because the surface is a private gift, not product marketing. All motion still respects `prefers-reduced-motion`. Editor chrome (`/gift`) follows the base system unchanged.

**Envelope + 3-face letter (added 2026-07-09).** The yes-no player gains an envelope stage (GSAP squash-bounce idle; tap 1 opens the flap, tap 2 pulls the letter) and a 3-face letter (front cover → main with typewriter body, stamp, stickers → back with spinning vinyl + Spotify-style lyric walk; close folds it back into the envelope, re-openable). Envelope colour tokens (`--env-base` / `--env-deep`, selected via `data-env` in `globals.css`): `cream` `oklch(0.93 0.02 85)`/`oklch(0.87 0.03 82)` · `rose` `oklch(0.90 0.045 15)`/`oklch(0.84 0.06 15)` · `kraft` `oklch(0.85 0.045 75)`/`oklch(0.78 0.055 72)` · `sky` `oklch(0.90 0.04 230)`/`oklch(0.83 0.05 235)`. Letter back panel: `oklch(0.25 0.015 60)` with light text `oklch(0.92–0.93 0.012–0.015 80)`. Stamp ink: `--color-danger`. GSAP (`gsap` + `@gsap/react`) is the animation layer for these gift surfaces.
