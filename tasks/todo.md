# Vishvavahini Relaunch — Live Site Audit & Integration Plan

> **MILESTONE (1 Jul 2026): SOFT-LAUNCHED.** v1.0 is LIVE on `vishtv.com` (PR #1 merged), fully
> functional and **non-indexed** (soft launch), running parallel to Wix. 2,481 articles + 991
> videos verified in production. Remaining: bake → cutover (indexing on + `vishvavahini.com` DNS
> repoint) → decommission Wix. See `docs/MIGRATION-CUTOVER.md` + `docs/DEVELOPMENT-LOG.md`.

Comparison of the live Wix site (vishvavahini.com) vs. the new Next.js + Sanity app (vishtv).
Goal: integrate **only the required** missing functionality to reach launch parity — not rebuild Wix.

## TL;DR
The new app already matches or beats ~80% of the live site. The live site is a stock **Wix**
template; the new app is architecturally superior (Next.js 16 + Sanity, branded video intro,
TV 10-foot mode, ISR, i18n scaffold). The real work is **content migration** + a handful of
**parity gaps** (search, news category filter, SEO sitemaps, contact form, related articles,
privacy page, radio URL). The Wix "engagement" layer (comments/likes/ratings/views, member
accounts) is optional — defer unless community engagement is a launch requirement.

---

## Feature parity matrix (live site → new app)

| Live site feature | New app status | Action |
|---|---|---|
| Live TV (YouTube embed) | ✅ Better (logo intro, LIVE badge, redirect) | none |
| Radio / audio | ⚠️ Player built; needs real stream URL | wire `radioStreamUrl` |
| News blog (~800 Sinhala posts) | ⚠️ Article system built, **no content** | **MIGRATE CONTENT** |
| News category filter tabs | ⚠️ Categories exist, no filter UI on /news | build filter UI |
| VOD via YouTube | ✅ Built | none |
| Teledrama episode catalog | ✅ Covered by programmes/browse | seed as programmes |
| Movies section | ✅ Covered by category/programme | seed as category |
| Events showcase + ticket links | ✅ Built (ticketUrl) | none |
| Author attribution | ✅ Built | none |
| Date display | ✅ Built / read-time ❌ | add read-time (minor) |
| Related / recent posts | ❌ Missing on news detail | add related articles |
| Search | ❌ Dead placeholder (icon only) | **build search** |
| Contact form | ❌ Static page, no form | build submit form |
| Advertise page | ✅ Built | none |
| Privacy policy | ❌ Missing | add page |
| About / mission | ✅ Built | none |
| Multilingual EN + SI | ⚠️ UI toggle only; content not filtered | filter by language |
| Tamil UI | ❌ (live site also lacks it) | skip |
| Social links + sharing | ⚠️ Links yes; per-post share ❌ | add share buttons |
| SEO sitemap.xml / robots | ❌ Missing (Wix auto-gens ~800 URLs) | **add sitemap/robots** |
| SEO meta / OG | ✅ Built | none |
| Member accounts / login | ❌ Placeholder avatar | defer (Phase 3) |
| Comments / likes / ratings / views | ❌ Not built | defer (Phase 3, optional) |
| Mobile app landing | placeholder both sides | skip |

---

## What NOT to bring over
- Wix-specific chrome, member profiles, Wix Blog engagement widgets as-is.
- Tamil is not on the live site — don't add unless desired.
- "Mobile" menu page (placeholder on live site too).
- Movies/Radio as thin pages — the new app already models these better.

---

## CMS decision (resolved 2026-06-30)
**Sanity is the CMS** — already embedded at `/studio`, no new CMS needed. Its 8 schemas
(article, video, programme, category, event, schedule, siteSettings, youtubeEmbed) map 1:1 to
every live-site content type, plus a content-manager desk structure, `CONTENT-MANAGER-GUIDE.md`,
and `LAUNCH-CHECKLIST.md` already exist.

**Plan tier: launch on FREE ($0).** Sizing vs. Sanity pricing (June 2026):

| Resource | Est. usage | Free cap | Growth cap |
|---|---|---|---|
| Documents | ~1,900 (≈3,800 with drafts) | 10,000 | 25,000 |
| Asset storage | ~1–3 GB (YouTube embeds store nothing) | 100 GB | 100 GB |
| API CDN requests | low (ISR-cached) | 1M/mo | 1M/mo |
| Bandwidth | low (Vercel/ISR fronts reads) | 100 GB/mo | 100 GB/mo |

Free-tier caveats: **Admin + Viewer roles only** (no granular Contributor/Editor) and
**public dataset** (published content anonymously queryable — acceptable for public news).

**Upgrade to Growth ($15/seat/mo)** only when: non-Admin contributor roles, approval workflow,
private dataset, or nearing 100 GB/mo bandwidth. Billing flip only — no migration.

Open follow-up: optional `author` document type for named bylines (live site shows individual
contributors; current schema stores author as a plain string defaulting to "News Room").

---

## Dataset consolidation (resolved)
Two datasets existed: `production` (had the 2,481 migrated articles + 10 categories, 0 videos) and
`development` (had 991 videos + 16 programmes, 0 articles). dev.vishtv.com (Preview) pointed at
`development`, so dev showed no articles. **Decision: single `production` dataset.** Copied 991
videos + 16 programmes from development → production via `scripts/migrate-wix/copy-docs.mjs`
(preserves _id + refs; 239 video→programme refs intact). production is now complete:
2,481 articles + 991 videos + 16 programmes + 10 categories.
**ACTION (Vercel): set Preview `NEXT_PUBLIC_SANITY_DATASET` = `production`** (was `development`),
then redeploy dev. Production env var already = `production`.

## Live stream (DONE — verified on dev)
- [x] `/watch` embeds the YouTube channel live_stream (`embed/live_stream?channel=ID`) —
      auto-plays the current broadcast, zero quota, zero manual updates. `liveStreamVideoId`
      kept as optional manual override. Fixed the "recording not available" dead-id bug.
- Optional later: cached API live-detection for a branded offline state + reliable LIVE badge
      (quota trade-off) — deferred; channel runs near-continuous stream.

## Home trending + tile images (DONE — verified on dev)
- [x] Tile images: newsroom tiles render `featuredImage`; trending/most-watched show video
      thumbnails. Verified: 0 gradient-fallback tiles on home.
- [x] Video popularity: added `viewCount`/`weeklyViews`/`viewSnapshots` to schema; backfilled
      990 videos' view counts (`backfill-viewcounts.mjs`). "Most watched" ranks by all-time views.
- [x] News popularity: `/api/track-view` + `TrackView` beacon increment `article.viewCount`;
      "Most read" row appears once views accrue.
- [x] Weekly: `/api/refresh-stats` cron (daily 04:00) snapshots view counts + computes
      `weeklyViews` (7-day delta) for videos and articles. Registered in vercel.json.
- [x] Home rows: Trending this week (weekly→recent fallback), Most watched (all-time),
      From the newsroom (weekly→recent, images), Most read (all-time, hidden until data).
- Note: weeklyViews = 0 until ~7 days of cron snapshots exist; news views accrue from launch.

## Home trending + tile images (spec)
Goal: real popularity ranking + framed images in Trending/newsroom tiles.
- Tiles: newsroom tiles render article `featuredImage`; trending shows videos (YouTube thumbs).
- Videos: `viewCount` (all-time, from YouTube statistics — already fetched in youtube.ts) +
  `weeklyViews` (7-day delta from self-tracked `viewSnapshots`). Backfill 991 viewCounts once.
- News: build view tracking — `/api/track-view` increments `article.viewCount`; daily snapshots →
  `weeklyViews`. Rank trending (weekly) + all-time (total).
- Cron `/api/refresh-stats` (daily): refresh video viewCounts, append snapshots (videos+articles),
  recompute `weeklyViews`.
- Constraints noted: YouTube public API = all-time only (weekly via snapshots, builds from now);
  each article view = 1 Sanity write (watch free-tier 250k/mo API cap).

## Integration plan (prioritized)

### Phase 0 — Critical path: content migration (BLOCKER for launch)
> **Constraint: migration is DATA-ONLY — no UI/style changes.** The script only writes documents
> into existing Sanity schemas the UI already renders; it never edits components, CSS, layout, or
> config. Discipline: map each Wix field → the exact field the UI consumes; **upload images into
> Sanity** (served from `cdn.sanity.io`, never hotlink `static.wixstatic.com`); convert HTML body
> → Portable Text using only the schema's allowed blocks; seed `category` refs first. Sinhala font
> already covered by `Noto Sans Sinhala` in `reset.css`.
- [x] Identify data source — validated Wix Blog API (`communities-blog-node-api`):
      `v3/posts/query` for posts+richContent, `v3/categories/query`, public access-token auth.
      **~2,481 posts** (more than the earlier ~800 estimate), 10 categories.
- [x] Map Wix post → Sanity `article` (title, slug, featuredImage, category, body→Portable Text,
      author, publishedAt, language). Sinhala titles/slugs handled.
- [x] Seed `category` taxonomy from Wix (Sports, Politics, International, Local, Main news,
      Featured, Art/Music, Video, Movies, Teledrama).
- [x] Write migration script under `scripts/migrate-wix/` (modular: wix/ricos/sanity/env + CLI).
      `npm run migrate:wix` with `--dry-run --limit --lang --skip-existing --concurrency`.
- [x] Dry-run validated (5 posts): clean Portable Text, images detected, 0 failures.
- [x] **Live smoke test passed** (`--limit=5`): 5 articles + 10 categories + 6 image assets
      written to production (`cyxq3hr1`). Verified via GROQ — Sinhala titles/body intact, featured
      + inline images resolving from cdn.sanity.io, category refs correct, original 2024 dates.
- [x] **Full migration complete** — **2,481 articles** in Sanity (2,472 with category, 2,453 with
      featured image, 2,088 image assets, 10 categories). First run: 2,475 ok / 6 failed on bad
      images; fixed image-upload to skip-on-error and backfilled the 6 via `--ids` (now 0 failures).
- [x] **Language retag done** — `scripts/migrate-wix/retag-language.mjs` retagged 2,478
      Sinhala-script articles to `si` (3 genuinely-English left `en`).
- [ ] (Refinement) Reclassify Movies/Teledrama posts → `video` + `programme` (currently all
      import as `article` with inline `youtubeEmbed`).
- [ ] (Refinement) Resolve real author names via Wix Members API (currently "News Room").

### Phase 1 — Launch parity gaps (small, high value)
- [x] **Dataset access fix (was blocking ALL content):** dataset is private; the read client had
      no token, so the live site couldn't read any Sanity content. Per decision, kept dataset
      private + added a **server-only read token**. Split `urlFor` into client-safe `src/sanity/image.ts`;
      made `src/sanity/client.ts` `server-only` with `SANITY_API_READ_TOKEN` (falls back to
      `SANITY_API_TOKEN`); repointed the `PortableTextBody` client component to `@/sanity/image`;
      added `server-only` dep. Verified: sitemap now renders all 2,481 article URLs (2,490 total).
      **ACTION: add `SANITY_API_READ_TOKEN` (a Viewer token) in Vercel** (works today via the
      existing token fallback, but a dedicated read token is recommended).
- [x] **Search** — new `/search` page (server-rendered GET form, no extra client JS) with
      `searchQuery` across articles/videos/programmes; topbar search icon now links to it (topbar
      visually unchanged). Verified at runtime: "T20" → News results + real links; Sinhala terms
      match. `robots: noindex` on results. Build + lint clean.
- [x] **News category filter** UI on `/news` — server-side `?category=` filter using the design
      system's `.chip` pills; `newsListFilteredQuery` + `newsCategoriesQuery`. Verified vs live data.
- [x] **Related articles** block on `news/[slug]` — same-category, latest 4, via `related` in
      `articleQuery`. Verified. New CSS matches existing tokens; build + lint clean.
- [x] **sitemap.xml + robots.txt** — added `src/app/sitemap.ts` (static routes + all
      article/programme/video slugs via `sitemapQuery`, hourly revalidate) and `src/app/robots.ts`
      (disallows /studio + /api). Typecheck + lint clean. Additive only — no UI/style changes.
- [x] **301 redirect map** — added `/post/:slug → /news/:slug` (preserves ~2,481 indexed Wix
      article URLs since slugs match) and `/event-list → /events` in `next.config.ts`.
- [x] **Privacy policy** — `/privacy` rebuilt from the live Wix policy (13 sections), matching the
      static-page style. Added to sitemap + `/privacy-policy → /privacy` redirect. Build + lint clean.
- [x] **Contact form → Sanity** — `contactMessage` schema + Studio "Messages" desk item; server
      action (honeypot + validation) writes via write client; `ContactForm` client component with
      success/error state on `/contact`. Verified write→read→delete.
- [ ] **Radio stream URL** — populate `radioStreamUrl` in Site Settings (your task in `/studio`).
- [~] **Per-language content filtering** — DE-SCOPED. Data is 2,478 si vs 3 en; filtering content
      by the toggle would empty the site in EN mode. Toggle stays a UI-label switch (current
      behaviour). Revisit only if a real English content stream is added.

### Phase 2 — Polish (post-launch quick wins)
- [ ] Social share buttons on articles/videos.
- [ ] Read-time on articles.
- [ ] Wire `getLiveStreamStatus()` (already implemented, unused) for auto LIVE detection.
- [ ] Render the announcement bar (schema + i18n exist, no component).
- [ ] News pagination UI (query already supports `$start/$end`).

### Phase 3 — Community / engagement (optional, only if required)
- [ ] Member accounts (NextAuth or Sanity-backed) — needed only as prerequisite for the below.
- [ ] Comments, likes, ratings, view counts (consider a lightweight 3rd-party or Sanity-backed
      approach rather than rebuilding Wix Blog from scratch).
- [ ] Watchlist / "My list" (i18n key already exists).

---

## Radio Integration (added 11 Jul 2026)

Research: `docs/radio-integration-research.md` · Runbook: `docs/radio-operations-runbook.md`.
Current backend: Centova Cast v3.3.2 → SHOUTcast DNAS v2 (MP3 128k). Target: self-hosted AzuraCast.

### Phase 0 — Persistent web player (DONE, shipped, verified)
- [x] `src/lib/radio.ts` — types + SHOUTcast **and** AzuraCast now-playing normalizers (auto-detected), status-URL derivation.
- [x] `src/app/api/nowplaying/route.ts` — server proxy (fixes HTTPS/CORS), 10s cache, graceful offline. Single seam to swap backends.
- [x] `RadioPlayerProvider` — one `<audio>` in the root layout that survives navigation; reconnect watchdog (capped backoff, intent-gated); Media Session (lock-screen) wiring; now-playing polling.
- [x] `RadioMiniBar` (persistent across routes) + `RadioStage` (/radio player) + `PlayerIcons`.
- [x] Sanity `siteSettings`: `radioStationName`, `radioStatusUrl` (+ query) — CMS-managed, AzuraCast-ready.
- [x] i18n (en + si) radio keys. Verified: `tsc` clean, `eslint` clean, `next build` green, live SHOUTcast parse correct, all routes 200.

### Phase 1/2 app-side — AzuraCast-ready (DONE)
- [x] `/api/nowplaying` auto-detects SHOUTcast vs AzuraCast → **cutover is a CMS-only change** to `radioStatusUrl`. No redeploy.

### Phase 3 app-side — Browser Web DJ (DONE, dormant until configured)
- [x] Sanity `radioWebDjUrl` field (+ query); `/radio/go-live` page + `GoLivePanel` (gated); "Presenter? Go live →" link on /radio.

### Infra (needs server/DNS access — see runbook)
- [ ] Phase 1: Provision Singapore/Mumbai VPS, install AzuraCast, recreate station keeping SHOUTcast mount/URL, import library + playlists + schedule, test 24/7.
- [ ] Phase 2: Cutover — set `radioStreamUrl`/`radioStatusUrl` in Sanity, preserve old URL via DNS/nginx, low-traffic flip, keep old box hot 1–2 wks.
- [ ] Phase 3: Create streamer accounts, set `radioWebDjUrl` in Sanity, brief presenters (desktop; Mixxx/BUTT fallback).
- [ ] Phase 4: HLS mount + Cloudflare; richer now-playing (album art/history) via AzuraCast SSE.

### To activate the new player on production NOW (no infra change)
- [ ] Confirm **Sanity → Site Settings → `radioStreamUrl`** is set to the SHOUTcast proxy URL (the player + now-playing then work against the existing server immediately).

## Review
_(to be filled in after implementation)_

### Radio integration review (11 Jul 2026)
- Replaced the bare `<audio>` tag with a persistent, resilient, metadata-aware player across the whole app, using the codebase's existing React-Context pattern (no new dependencies) and design tokens.
- Verified end-to-end against the **live** stream: status-URL derivation, now-playing parse (SHOUTcast + AzuraCast), all routes return 200, production build green. A real bug (mixed `??`/`||`) was caught by the build and fixed.
- Backend migration is app-ready: SHOUTcast→AzuraCast cutover and Web DJ activation are **CMS-only** changes. Remaining work is infrastructure (VPS/DNS), documented in the runbook.

### UI verification + reconnect bug fix (12 Jul 2026)
- Verified radio UI in a real browser: it's in the **primary nav (Topbar + MobileDrawer), Footer, the `/radio` player, a site-wide mini-bar, and `/radio/go-live`**.
- **Bug found & fixed during browser testing:** the player reconnected on the `<audio>` `stalled` event, which fires during normal buffering → reconnect loop ("Reconnecting…" forever). Fixed in `RadioPlayerProvider.tsx`: removed `stalled`→reconnect; now reconnects only on `error`/`ended` plus a **stall watchdog** (reconnect only if `currentTime` doesn't advance for 12s). Build green.
- Note: audible playback couldn't be confirmed in the automation browser — a known-good public control stream (SomaFM) also stalled there, i.e. that instrumented Chrome doesn't pull continuous media streams. Stream itself is fine (fetch/curl pull audio; it plays on the live site). Verify audibly in a normal browser once `radioStreamUrl` is set in prod.
