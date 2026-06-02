import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'
import { projectId, dataset, apiVersion } from './env'

const isConfigured = projectId && projectId !== 'placeholder' && /^[a-z0-9-]+$/.test(projectId)

const rawClient = createClient({
  projectId: isConfigured ? projectId : 'not-configured',
  dataset,
  apiVersion,
  useCdn: true,
})

/**
 * Sanity client with timeout protection.
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

const builder = createImageUrlBuilder(rawClient)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}
