import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from './env'

/**
 * Sanity client with write permissions.
 * Only used in server-side API routes (e.g. YouTube sync cron).
 * Requires SANITY_API_TOKEN environment variable.
 */
const safeProjectId = /^[a-z0-9-]+$/.test(projectId) ? projectId : 'not-configured'

export const writeClient = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
