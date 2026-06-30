import { createImageUrlBuilder } from '@sanity/image-url'
import { projectId, dataset } from './env'

/**
 * Image URL builder. Needs only projectId + dataset (no token), so this module is safe to
 * import from Client Components. Keep data-fetching (which uses a token) in `./client`, which
 * is server-only.
 */
const builder = createImageUrlBuilder({ projectId, dataset })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}
