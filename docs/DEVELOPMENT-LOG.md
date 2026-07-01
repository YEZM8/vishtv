# VishTV — Development & Release Log

Everything built for the Vishvavahini → VishTV relaunch, from project inception to the current
deployment. Grouped by release phase.

_Generated: 2026-07-01 · 21 commits · 21 May → 1 July 2026 · 107 files changed (+26,549 / −4,086)_

---

## Deployment status (at time of writing)

| Environment | URL | Branch | At commit | Contains |
|---|---|---|---|---|
| **Production** | vishtv.com | `main` | `4923e94` (1 Jul) | **v1.0 — LIVE (non-indexed soft launch)** |
| **Dev / Staging** | dev.vishtv.com | `dev` | `5f11485` (1 Jul) | Everything through v1.0 |
| **Legacy (Wix)** | vishvavahini.com | — | — | Old site, still live in parallel |

**v1.0 is LIVE in production on `vishtv.com`** (PR #1 merged) as a **non-indexed soft launch**
(`ALLOW_INDEXING` off → `robots: Disallow /` + `<meta noindex>`), running in parallel with the
old Wix site. Content verified: 2,481 articles + 991 videos serving; sitemap 3,498 URLs.

**Production env note:** the private Sanity dataset requires `SANITY_API_READ_TOKEN` scoped to
**Production** (and a redeploy so `NEXT_PUBLIC_*` re-bake). Missing this scope was why production
first showed no content until fixed.

**Next:** bake period → cutover (`ALLOW_INDEXING=true` + repoint `vishvavahini.com` DNS → 301s +
GSC Change of Address) → decommission Wix (secure the domain first). See `MIGRATION-CUTOVER.md`.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**, TypeScript
- **Sanity 5** headless CMS (embedded Studio at `/studio`), private dataset + server-only read token
- Plain CSS (design tokens + CSS Modules), custom in-house i18n (EN/SI)
- **YouTube Data API v3** (sync, stats, live detection); YouTube iframe playback
- **Vercel** hosting, ISR, cron jobs, Analytics + Speed Insights

---

## v0.1.0 — Foundation (2–3 Jun 2026)

The initial build: a working Next.js + Sanity site with the core pages and CMS.

- **Project scaffold** — Next.js + Sanity + design system (tokens, reset, utilities).
- **Core layout & pages** — home, watch, browse with Netflix-style content rows and tiles.
- **Content pages + Sanity Studio** mounted at `/studio` with a content-manager desk structure.
- **TV / 10-foot mode** (`?tv=1`) with D-pad keyboard navigation.
- **YouTube auto-sync cron** — daily import of channel videos into Sanity.
- **Branded video intro** overlay on the player; live-stream support via Site Settings.
- **News, events, radio** pages; Portable Text article bodies.
- **i18n** English/Sinhala toggle; **legacy redirects**; SEO/OpenGraph metadata.
- Content-manager guide + launch checklist; Vercel deploy config; cron set to daily (Hobby plan).

_Commits: d0bab5c, 528f97b, 6baed71, 6c001af, 451e037, ea29aa4, 59b34b6, 1b2e4b8, cc1d56e_
**→ Was the production baseline until v1.0 shipped (1 Jul).**

---

## v0.2.0 — Video backfill (7 Jun 2026)

- **Backfilled ~991 YouTube videos** into Sanity (backfill scripts).
- **Browse page** shows all videos (removed the 60-item cap).
- ISR cache busting after backfill.

_Commits: 6a6e22a, bdd2420, 17e6ca8_

---

## v1.0.0 — Phase 1 relaunch (30 Jun – 1 Jul 2026)

The major relaunch: real content migrated from the live Wix site, plus search, SEO, popularity
ranking, an autonomous live stream, and the full traffic-migration plan. Verified on dev.

### Content migration
- **Migrated 2,481 news articles** from the live Wix blog into Sanity (Wix Blog API → Portable Text),
  with images uploaded to Sanity's CDN, category taxonomy, and preserved publish dates.
- **Consolidated to a single `production` dataset** (2,481 articles + 991 videos + 16 programmes +
  10 categories); copied videos/programmes across from the `development` dataset.
- **Language retag** — 2,478 Sinhala-script articles tagged `si`.
- Migration tooling under `scripts/migrate-wix/` (idempotent, dry-run capable).

### CMS & security
- **Private dataset + server-only read token** architecture — split token-free `urlFor`
  (`sanity/image.ts`) from the server-only read client so the token never reaches the browser;
  `write-client` marked server-only.
- **Contact form → Sanity** — `contactMessage` schema + Studio "Messages" inbox; server action with
  honeypot, validation, and same-origin protection.

### SEO
- **`sitemap.xml`** (3,498 URLs: articles + videos + programmes + static pages).
- **`robots.txt`** — environment-aware (staging/dev correctly `noindex`).
- **301/308 redirects** — every legacy Wix URL → new URL in a **single hop**
  (`/post/<slug>`→`/news/<slug>`, `/all-news`→`/news`, `/tv-live`→`/watch`, etc.).

### Features
- **Search** — `/search` across articles, videos, programmes (English + Sinhala); topbar wired.
- **News category filter** on `/news` (design-system chip pills).
- **Related articles** on each article (same category, latest 4).
- **Privacy policy page** rebuilt from the live Wix policy.
- **Home popularity rows** with framed images: **Trending this week** (momentum), **Most watched**
  (all-time), **From the newsroom**, **Most read** — no more gradient placeholders.
- **View-tracking + popularity system** — article view counter (`/api/track-view`), daily
  `refresh-stats` cron computing weekly view deltas + a `trendingScore` (real weekly views, or view
  velocity until snapshots accrue).
- **Autonomous live stream** — `/watch` detects the channel's current live broadcast via the YouTube
  API (cached), with a graceful off-air state; no manual updates needed.

### Fixes & hardening
- **Fixed Sinhala article pages** — this Next.js version doesn't auto-decode route params, so
  percent-encoded Sinhala slugs weren't resolving ("Article not found"); added `decodeSlug`.
- **16:9 trending tiles** so video thumbnails fit without cropping.
- Pre-merge review hardening: API-detected live, view-tracking abuse guard, authenticated CDN reads.

### Documentation
- **Migration & cutover plan** (`docs/MIGRATION-CUTOVER.md` + PDF): DNS-move strategy, launch-first
  sequencing, SEO handoff, Wix-takedown risk checklist.

_Commits: bae2459, 04be84e, cf71b3f, 7295964, 5229fb3, a046b4e, 231fff4, 7d06624, 97d2475_

---

## Feature inventory (current, on dev)

**Content & CMS:** 2,481 articles · 991 videos · 16 programmes · 10 categories · embedded Sanity
Studio · contact-message inbox · Site Settings singleton · daily YouTube sync.
**Discovery:** search · news category filter · related articles · trending/most-watched/most-read
rows · browse by programme.
**Playback:** YouTube embeds · branded intro · autonomous live stream · radio.
**Popularity:** article view tracking · weekly + all-time rankings · daily stats cron.
**Platform:** private dataset + server-only tokens · ISR · env-aware SEO (sitemap/robots) · single-hop
legacy redirects · EN/SI i18n · TV 10-foot mode · Vercel Analytics + Speed Insights.

---

## Known follow-ups (not yet built)

- Browse page renders up to 2,000 image tiles — add pagination/"load more".
- Contact form rate-limiting (currently: Next server-action CSRF + honeypot).
- Optional: named author profiles; Movies/Teledrama reclassified as `video`+`programme`.
- Weekly-trending data becomes accurate ~7 days after the stats cron begins running in production.
