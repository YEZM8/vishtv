#!/usr/bin/env node
/**
 * Wix -> Sanity content migration (Phase 0).
 *
 * DATA-ONLY: writes documents into the existing `article` / `category` schemas. It never edits
 * components, CSS, layout, or config. Re-runnable / idempotent (deterministic _ids).
 *
 * Usage:
 *   node scripts/migrate-wix/migrate.mjs --dry-run            # no writes; transform + report
 *   node scripts/migrate-wix/migrate.mjs --limit=5            # import first 5 (smoke test)
 *   node scripts/migrate-wix/migrate.mjs                      # full migration
 *   node scripts/migrate-wix/migrate.mjs --skip-existing      # don't overwrite edited docs
 *   node scripts/migrate-wix/migrate.mjs --lang=si            # only Sinhala posts
 *
 * Flags: --dry-run  --limit=N  --page-size=N  --lang=en|si  --skip-existing  --concurrency=N  --verbose
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadEnv, getSanityConfig } from './lib/env.mjs'
import { WixBlog } from './lib/wix.mjs'
import { ricosToPortableText } from './lib/ricos.mjs'
import { SanityLoader } from './lib/sanity.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')

function parseArgs(argv) {
  const args = { pageSize: 50, concurrency: 4, mode: 'replace' }
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--skip-existing') args.mode = 'skip-existing'
    else if (a === '--verbose') args.verbose = true
    else if (a.startsWith('--limit=')) args.limit = Number(a.split('=')[1])
    else if (a.startsWith('--page-size=')) args.pageSize = Number(a.split('=')[1])
    else if (a.startsWith('--lang=')) args.lang = a.split('=')[1]
    else if (a.startsWith('--concurrency=')) args.concurrency = Number(a.split('=')[1])
    else if (a.startsWith('--ids=')) args.ids = new Set(a.split('=')[1].split(',').filter(Boolean))
  }
  return args
}

/** Simple promise pool. */
async function pool(items, concurrency, worker) {
  const results = []
  let idx = 0
  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (idx < items.length) {
      const i = idx++
      results[i] = await worker(items[i], i)
    }
  })
  await Promise.all(runners)
  return results
}

function langValue(wixLang) {
  return wixLang === 'si' ? 'si' : wixLang === 'en' ? 'en' : 'si'
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  loadEnv(REPO_ROOT)
  const cfg = getSanityConfig()

  console.log('Wix -> Sanity migration')
  console.log(`  mode: ${args.dryRun ? 'DRY-RUN (no writes)' : args.mode}`)
  console.log(`  dataset: ${cfg.projectId || '(none)'} / ${cfg.dataset}`)
  if (args.limit) console.log(`  limit: ${args.limit}`)
  if (args.lang) console.log(`  lang filter: ${args.lang}`)

  if (!args.dryRun && cfg.missing.length) {
    console.error(`\nMissing env vars: ${cfg.missing.join(', ')}`)
    console.error('Set them in .env.local (or run with --dry-run).')
    process.exit(1)
  }

  const wix = new WixBlog()
  const loader = new SanityLoader({ ...cfg, dryRun: !!args.dryRun })

  console.log('\nAuthenticating with Wix Blog API...')
  await wix.auth()
  const categories = await wix.getCategories()
  console.log(`  categories: ${categories.size}`)
  // Pre-create category docs (stable order = insertion order)
  let order = 0
  for (const [wixId, cat] of categories) {
    await loader.ensureCategory(wixId, cat, order++)
  }

  // Collect posts first (so we can pool the heavy per-post work)
  console.log('\nFetching post list from Wix...')
  const posts = []
  for await (const p of wix.iteratePosts({ pageSize: args.pageSize, max: args.ids ? Infinity : args.limit ?? Infinity })) {
    if (args.ids && !args.ids.has(p.id)) continue
    if (args.lang && langValue(p.language) !== args.lang) continue
    posts.push(p)
  }
  console.log(`  posts to process: ${posts.length}`)

  const stats = { ok: 0, failed: 0, images: 0, ytEmbeds: 0, noBody: 0 }
  const failures = []

  await pool(posts, args.concurrency, async (post, i) => {
    try {
      const title = post.title || '(untitled)'
      const slug = post.seoSlug || post.slug || post.slugs?.[0]
      const body = await ricosToPortableText(post.richContent, {
        onImage: (id, meta) => loader.imageBlock(id, meta),
      })
      const imageBlocks = body.filter((b) => b._type === 'image').length
      const ytBlocks = body.filter((b) => b._type === 'youtubeEmbed').length
      stats.images += imageBlocks
      stats.ytEmbeds += ytBlocks
      if (body.length === 0) stats.noBody++

      // Featured / cover image
      const coverId = post.media?.wixMedia?.image?.id
      let featuredImage
      if (coverId) {
        const assetId = await loader.uploadImage(coverId)
        if (assetId) {
          featuredImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
        }
      }

      // Category reference (first category)
      let categoryRef
      const firstCat = post.categoryIds?.[0]
      if (firstCat && categories.has(firstCat)) {
        const catId = await loader.ensureCategory(firstCat, categories.get(firstCat))
        categoryRef = { _type: 'reference', _ref: catId }
      }

      const doc = {
        _id: `article.wix-${post.id}`,
        _type: 'article',
        title: title.slice(0, 200),
        slug: { _type: 'slug', current: (slug || post.id).slice(0, 96) },
        body,
        author: 'News Room',
        publishedAt: post.firstPublishedDate || post.lastPublishedDate || new Date().toISOString(),
        language: langValue(post.language),
        ...(featuredImage ? { featuredImage } : {}),
        ...(categoryRef ? { category: categoryRef } : {}),
      }

      await loader.upsertArticle(doc, args.mode)
      stats.ok++
      if (args.verbose || (i + 1) % 50 === 0) {
        console.log(`  [${i + 1}/${posts.length}] ${doc._id}  "${title.slice(0, 50)}"`)
      }
    } catch (e) {
      stats.failed++
      failures.push({ id: post.id, title: post.title, error: e.message })
      console.warn(`  ! failed ${post.id}: ${e.message}`)
    }
  })

  console.log('\n=== Summary ===')
  console.log(`  articles imported: ${stats.ok}`)
  console.log(`  failed:            ${stats.failed}`)
  console.log(`  images uploaded:   ${loader.imageCache.size}`)
  console.log(`  inline images:     ${stats.images}`)
  console.log(`  youtube embeds:    ${stats.ytEmbeds}`)
  console.log(`  posts w/ empty body: ${stats.noBody}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures.slice(0, 20)) console.log(`  - ${f.id}: ${f.error}`)
    if (failures.length > 20) console.log(`  ...and ${failures.length - 20} more`)
  }
  if (args.dryRun) console.log('\n(DRY-RUN — no documents were written to Sanity)')
}

main().catch((e) => {
  console.error('\nFatal:', e)
  process.exit(1)
})
