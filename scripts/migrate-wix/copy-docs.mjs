#!/usr/bin/env node
/**
 * Copy documents of given types from one dataset to another (same project), preserving _id and
 * references. Idempotent (createOrReplace). Used to consolidate content into a single dataset.
 *
 * Usage:
 *   node scripts/migrate-wix/copy-docs.mjs --from=development --to=production --types=video,programme [--dry-run]
 */
import { createClient } from '@sanity/client'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadEnv, getSanityConfig } from './lib/env.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv(resolve(__dirname, '../..'))

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)
const FROM = args.from
const TO = args.to
const TYPES = String(args.types || '').split(',').filter(Boolean)
const dryRun = !!args['dry-run']

if (!FROM || !TO || TYPES.length === 0) {
  console.error('Usage: --from=<dataset> --to=<dataset> --types=video,programme [--dry-run]')
  process.exit(1)
}

const cfg = getSanityConfig()
const token = process.env.SANITY_API_TOKEN // needs write access on the destination
const mk = (dataset) =>
  createClient({ projectId: cfg.projectId, dataset, apiVersion: cfg.apiVersion, useCdn: false, token })

const src = mk(FROM)
const dest = mk(TO)

console.log(`Copy ${TYPES.join(', ')} : ${FROM} -> ${TO}${dryRun ? ' (dry-run)' : ''}`)

const query = `*[_type in $types && !(_id in path("drafts.**"))]`
const docs = await src.fetch(query, { types: TYPES })
console.log(`fetched ${docs.length} docs from ${FROM}`)

// Strip server-managed fields; keep _id, _type and all content (incl. references).
const clean = docs.map(({ _rev, _createdAt, _updatedAt, ...keep }) => keep)

if (dryRun) {
  const byType = clean.reduce((m, d) => ((m[d._type] = (m[d._type] || 0) + 1), m), {})
  console.log('would write:', JSON.stringify(byType))
  process.exit(0)
}

let n = 0
for (let i = 0; i < clean.length; i += 50) {
  let tx = dest.transaction()
  for (const d of clean.slice(i, i + 50)) tx = tx.createOrReplace(d)
  await tx.commit()
  n += Math.min(50, clean.length - i)
  console.log(`  written ${n}/${clean.length}`)
}
console.log(`Done. Copied ${n} docs to ${TO}.`)
