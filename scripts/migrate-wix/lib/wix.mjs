/**
 * Wix Blog reader — pulls posts and categories from the live vishvavahini.com Wix site
 * via its public Blog API (communities-blog-node-api). Read-only; no Wix login required.
 *
 * Auth: GET /_api/v1/access-tokens returns a per-app `instance` token. We grab the Blog app's
 * token and pass it as the Authorization header on subsequent Blog API calls.
 */

const SITE = 'https://www.vishvavahini.com'
const BLOG_APP_ID = '14bcded7-0066-7c35-14d7-466cb3f09103'
const BLOG_API = `${SITE}/_api/communities-blog-node-api`
const UA = 'Mozilla/5.0 (vishtv-migration)'

async function httpJson(url, { method = 'GET', headers = {}, body, retries = 3 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'User-Agent': UA, ...headers },
        body,
      })
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`)
      }
      if (!res.ok) {
        const text = await res.text()
        const err = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
        err.status = res.status
        throw err
      }
      return await res.json()
    } catch (e) {
      lastErr = e
      // Don't retry hard client errors (4xx that aren't 429)
      if (e.status && e.status >= 400 && e.status < 500 && e.status !== 429) throw e
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      }
    }
  }
  throw lastErr
}

export class WixBlog {
  constructor() {
    this.instance = null
  }

  async auth() {
    const data = await httpJson(`${SITE}/_api/v1/access-tokens`)
    const inst = data?.apps?.[BLOG_APP_ID]?.instance
    if (!inst) throw new Error('Could not obtain Wix Blog app instance token')
    this.instance = inst
    return inst
  }

  async _post(path, payload) {
    if (!this.instance) await this.auth()
    try {
      return await httpJson(`${BLOG_API}${path}`, {
        method: 'POST',
        headers: { Authorization: this.instance, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      // token can expire mid-run — refresh once and retry
      if (e.status === 401 || e.status === 403) {
        await this.auth()
        return await httpJson(`${BLOG_API}${path}`, {
          method: 'POST',
          headers: { Authorization: this.instance, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      throw e
    }
  }

  /** Returns Map<categoryId, {label, slug}>. */
  async getCategories() {
    const data = await this._post('/v3/categories/query', { paging: { limit: 100 } })
    const map = new Map()
    for (const c of data?.categories || []) {
      map.set(c.id, { label: c.label, slug: c.slug })
    }
    return map
  }

  /** One page of posts (with rich content). Returns the raw posts array. */
  async getPostsPage({ offset = 0, limit = 50 } = {}) {
    const data = await this._post('/v3/posts/query', {
      paging: { offset, limit },
      sort: [{ fieldName: 'firstPublishedDate', order: 'ASC' }],
      fieldsets: ['RICH_CONTENT', 'URL'],
    })
    return data?.posts || []
  }

  /** Async generator over ALL posts, paging until exhausted. */
  async *iteratePosts({ pageSize = 50, max = Infinity } = {}) {
    let offset = 0
    let yielded = 0
    while (yielded < max) {
      const page = await this.getPostsPage({ offset, limit: pageSize })
      if (page.length === 0) break
      for (const post of page) {
        yield post
        yielded++
        if (yielded >= max) return
      }
      offset += page.length
      if (page.length < pageSize) break
    }
  }
}

/** Build a downloadable URL for a Wix media id (e.g. "8b23a7_xxx~mv2.avif"). */
export function wixMediaUrl(id) {
  if (!id) return null
  if (id.startsWith('http')) return id
  return `https://static.wixstatic.com/media/${id}`
}
