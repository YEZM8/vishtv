import 'server-only'
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from './env'

// Re-export the client-safe image builder so existing server-component imports keep working.
// Client Components must import urlFor from '@/sanity/image' instead (this module is server-only).
export { urlFor } from './image'

const isConfigured = projectId && projectId !== 'placeholder' && /^[a-z0-9-]+$/.test(projectId)

// Server-only read token. Prefer a dedicated read token; fall back to the existing API token.
// The dataset is private, so reads must be authenticated. This module never reaches the browser.
const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN

const rawClient = createClient({
  projectId: isConfigured ? projectId : 'not-configured',
  dataset,
  apiVersion,
  // Authenticated CDN reads: faster + cheaper (served from Sanity's CDN, ~60s freshness).
  // Works with a token on a private dataset; ISR revalidation handles staleness.
  useCdn: true,
  token,
})

/**
 * Sanity read client with timeout protection.
 * Returns null for queries when Sanity is not configured (placeholder project ID).
 */
export const client = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fetch(query: string, params?: Record<string, any>): Promise<any> {
    if (!isConfigured) return null

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const result = await rawClient.fetch(query, params, {
        signal: controller.signal,
      })
      return result
    } catch {
      console.warn('Sanity fetch failed — returning null')
      return null
    } finally {
      clearTimeout(timeout)
    }
  },
}
