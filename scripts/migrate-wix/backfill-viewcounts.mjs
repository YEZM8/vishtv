#!/usr/bin/env node
/**
 * One-time backfill of video view counts from YouTube into Sanity, so "Most watched" (all-time)
 * works immediately. Also seeds an initial view snapshot. Weekly views accrue from the daily
 * refresh-stats cron afterwards. Idempotent.
 *
 * Usage: node scripts/migrate-wix/backfill-viewcounts.mjs [--dry-run]
 */
import { createClient } from '@sanity/client'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadEnv, getSanityConfig } from './lib/env.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv(resolve(__dirname, '../..'))

const dryRun = process.argv.includes('--dry-run')
const cfg = getSanityConfig()
const YT_KEY = process.env.YOUTUBE_API_KEY
if (!YT_KEY) { console.error('Missing YOUTUBE_API_KEY'); process.exit(1) }

const client = createClient({
  projectId: cfg.projectId, dataset: cfg.dataset, apiVersion: cfg.apiVersion,
  useCdn: false, token: process.env.SANITY_API_TOKEN,
})

async function statsFor(ids) {
  const map = new Map()
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const params = new URLSearchParams({ part: 'statistics', id: batch.join(','), key: YT_KEY })
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
    if (!res.ok) { console.warn('  ! YT batch failed', res.status); continue }
    const data = await res.json()
    for (const item of data.items || []) map.set(item.id, Number(item.statistics?.viewCount) || 0)
  }
  return map
}

const videos = await client.fetch(`*[_type=="video" && defined(youtubeId)]{ _id, youtubeId, publishedAt }`)
console.log(`videos: ${videos.length}`)
const stats = await statsFor(videos.map((v) => v.youtubeId))
console.log(`fetched view counts for ${stats.size} videos`)

const now = new Date().toISOString()
// Velocity = views per day since publish — the interim trending signal until weekly deltas exist.
const velocity = (count, publishedAt) => {
  if (!publishedAt) return 0
  const ageDays = Math.max(1, (Date.now() - new Date(publishedAt).getTime()) / 86400000)
  return Math.round(count / ageDays)
}
let n = 0, missing = 0
if (dryRun) {
  const sample = videos.slice(0, 5).map((v) => `${v.youtubeId}=${stats.get(v.youtubeId)} (score ${velocity(stats.get(v.youtubeId), v.publishedAt)})`)
  console.log('sample:', sample.join(', '))
  console.log('(dry-run — no writes)')
  process.exit(0)
}
let tx = client.transaction(), pending = 0
for (const v of videos) {
  const count = stats.get(v.youtubeId)
  if (count == null) { missing++; continue }
  tx = tx.patch(v._id, { set: { viewCount: count, trendingScore: velocity(count, v.publishedAt), viewSnapshots: [{ date: now, count }] } })
  n++
  if (++pending >= 100) { await tx.commit({ autoGenerateArrayKeys: true }); tx = client.transaction(); pending = 0; console.log(`  patched ${n}`) }
}
if (pending > 0) await tx.commit({ autoGenerateArrayKeys: true })
console.log(`Done. Set viewCount on ${n} videos (${missing} had no stat).`)
