# Wix → Sanity content migration (Phase 0)

One-time (re-runnable) migration of the live Wix blog at **vishvavahini.com** into the VishTV
Sanity dataset. It pulls every blog post via Wix's public Blog API, converts the rich content to
Portable Text, uploads images to Sanity, and writes `article` + `category` documents.

## Guarantees

- **Data-only.** Writes into the existing `article` / `category` schemas. Never touches
  components, CSS, layout, or config — the site's look/feel is unchanged.
- **Idempotent.** Deterministic IDs (`article.wix-<wixPostId>`, `category.wix-<slug>`); re-running
  updates the same docs instead of duplicating.
- **Self-hosted assets.** Images are downloaded from `static.wixstatic.com` and uploaded to
  Sanity, so they serve from `cdn.sanity.io` (already allowed in `next.config.ts`).

## Prerequisites

`.env.local` must contain (already used by the app):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...        # a Sanity token with WRITE (Editor) access
```

No Wix credentials are needed — the script obtains a public read token from the live site.

## Usage

```bash
# 1. Preview only — no writes, no creds required. Validates fetch + transform.
npm run migrate:wix -- --dry-run --limit=10 --verbose

# 2. Smoke test — write just a few real docs and check them in /studio.
npm run migrate:wix -- --limit=5

# 3. Full migration (~2,481 posts). Takes a while (image uploads dominate).
npm run migrate:wix

# Useful flags
--dry-run          # transform + report, write nothing
--limit=N          # only the first N posts
--lang=en|si       # only posts in one language
--skip-existing    # createIfNotExists — don't overwrite docs editors have changed
--concurrency=N    # parallel posts (default 4)
--page-size=N      # Wix API page size (default 50)
--verbose          # log every post
```

## What it maps

| Wix post field | → Sanity `article` |
|---|---|
| `title` | `title` (≤200 chars) |
| `seoSlug` / `slug` | `slug.current` (≤96) |
| `media.wixMedia.image` | `featuredImage` (uploaded asset) |
| `categoryIds[0]` | `category` → reference to a `category` doc |
| `richContent` (Ricos) | `body` (Portable Text) |
| `firstPublishedDate` | `publishedAt` |
| `language` | `language` (en/si) |
| author | `"News Room"` (Wix member names not resolved — see below) |

Rich content conversion (`lib/ricos.mjs`) maps **only** to the article schema's allowed blocks:
`normal/h2/h3/h4/blockquote`, `strong/em/link`, inline `image` (alt+caption), and `youtubeEmbed`
for embedded YouTube. Unsupported nodes (dividers, tables, GIFs, raw HTML) are skipped; lists
become Portable Text list items.

## Known limitations / follow-ups

- **Author** is hard-set to "News Room". Wix exposes only `memberId`; resolving real names needs
  the Wix Members API. Add later if individual bylines matter (pairs with the optional `author`
  document type noted in `tasks/todo.md`).
- **Article vs. video split:** all posts import as `article`; embedded YouTube is preserved inline
  via `youtubeEmbed`. Reclassifying Movies/Teledrama posts into `video` + `programme` is a
  separate refinement.
- **Comments / likes / ratings / view counts** from Wix are not migrated (deferred — Phase 3).

## Files

- `migrate.mjs` — orchestrator + CLI
- `lib/wix.mjs` — Wix Blog API client (auth, posts, categories)
- `lib/ricos.mjs` — Ricos → Portable Text transform
- `lib/sanity.mjs` — Sanity load layer (image upload, category/article upsert)
- `lib/env.mjs` — `.env.local` loader
