#!/usr/bin/env node
/**
 * Retag article language based on actual script.
 *
 * The Wix import set every article to language="en" (Wix's site locale), but the body text is
 * overwhelmingly Sinhala. This detects Sinhala script (Unicode U+0D80–U+0DFF) in the title and
 * sets language="si" so the EN/SI toggle filters correctly. Idempotent — re-runnable.
 *
 * Usage: node scripts/migrate-wix/retag-language.mjs [--dry-run]
 */
import { createClient } from '@sanity/client'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadEnv, getSanityConfig } from './lib/env.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')
const SINHALA = /[඀-෿]/

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  loadEnv(REPO_ROOT)
  const c = getSanityConfig()
  if (c.missing.length && !dryRun) {
    console.error(`Missing env: ${c.missing.join(', ')}`)
    process.exit(1)
  }
  const client = createClient({
    projectId: c.projectId,
    dataset: c.dataset,
    token: c.token,
    apiVersion: c.apiVersion,
    useCdn: false,
  })

  // Only fetch articles currently tagged en that have a Sinhala title.
  const candidates = await client.fetch(
    `*[_type=="article" && language=="en" && title match "*"]{ _id, title }`
  )
  const toFix = candidates.filter((a) => SINHALA.test(a.title || ''))
  console.log(`articles tagged en: ${candidates.length}`)
  console.log(`with Sinhala titles -> retag si: ${toFix.length}`)

  if (dryRun) {
    console.log('(dry-run — no changes)')
    return
  }

  let n = 0
  // Batch patches into transactions of 100
  for (let i = 0; i < toFix.length; i += 100) {
    const batch = toFix.slice(i, i + 100)
    let tx = client.transaction()
    for (const a of batch) tx = tx.patch(a._id, { set: { language: 'si' } })
    await tx.commit()
    n += batch.length
    console.log(`  patched ${n}/${toFix.length}`)
  }
  console.log(`Done. Retagged ${n} articles to si.`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
