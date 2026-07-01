import 'server-only'
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from './env'

/**
 * Sanity client with write permissions. Server-only — never import from a Client Component,
 * or the write token would leak into the browser bundle.
 * Used in server-side API routes / server actions (YouTube sync, stats refresh, view tracking,
 * contact form). Requires SANITY_API_TOKEN environment variable.
 */
const safeProjectId = /^[a-z0-9-]+$/.test(projectId) ? projectId : 'not-configured'

export const writeClient = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
