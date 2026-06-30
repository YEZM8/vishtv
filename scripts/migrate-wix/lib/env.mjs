import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Minimal .env.local loader (no dotenv dependency).
 * Next.js loads .env.local for the app automatically, but standalone Node scripts do not,
 * so we parse it here. Values already present in process.env take precedence.
 */
export function loadEnv(repoRoot) {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(resolve(repoRoot, file), 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        let val = trimmed.slice(eq + 1).trim()
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1)
        }
        if (process.env[key] === undefined) process.env[key] = val
      }
    } catch {
      // file may not exist — that's fine
    }
  }
}

export function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN
  const missing = []
  if (!projectId || projectId === 'placeholder') missing.push('NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!token) missing.push('SANITY_API_TOKEN')
  return { projectId, dataset, token, apiVersion: '2024-01-01', missing }
}
