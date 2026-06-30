import { createClient } from '@sanity/client'
import { wixMediaUrl } from './wix.mjs'

/**
 * Sanity load layer for the Wix migration. Writes documents into the EXISTING schemas
 * (article, category) — no schema/UI changes. Idempotent via deterministic _ids:
 *   article.wix-<wixPostId>   category.wix-<slug>
 * Images are downloaded from Wix and uploaded to Sanity (served from cdn.sanity.io),
 * never hotlinked from static.wixstatic.com.
 */
export class SanityLoader {
  constructor({ projectId, dataset, token, apiVersion, dryRun = false }) {
    this.dryRun = dryRun
    this.imageCache = new Map() // wixImageId -> sanity asset _id
    this.categoryRefCache = new Map() // wix categoryId -> sanity category _id
    this.client = dryRun
      ? null
      : createClient({ projectId, dataset, token, apiVersion, useCdn: false })
  }

  /** Download a Wix image and upload it as a Sanity asset. Returns asset _id (or null). */
  async uploadImage(wixImageId) {
    if (!wixImageId) return null
    if (this.imageCache.has(wixImageId)) return this.imageCache.get(wixImageId)
    if (this.dryRun) {
      this.imageCache.set(wixImageId, `image-DRYRUN-${this.imageCache.size}`)
      return this.imageCache.get(wixImageId)
    }
    const url = wixMediaUrl(wixImageId)
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'vishtv-migration' } })
      if (!res.ok) {
        console.warn(`  ! image download failed (${res.status}): ${wixImageId}`)
        this.imageCache.set(wixImageId, null)
        return null
      }
      const buf = Buffer.from(await res.arrayBuffer())
      const filename = wixImageId.split('/').pop()
      const asset = await this.client.assets.upload('image', buf, { filename })
      this.imageCache.set(wixImageId, asset._id)
      return asset._id
    } catch (e) {
      // A bad/unprocessable image must not drop the whole article — skip just the image.
      console.warn(`  ! image upload skipped (${e.message?.slice(0, 60)}): ${wixImageId}`)
      this.imageCache.set(wixImageId, null)
      return null
    }
  }

  /** Build a Portable Text inline image block from a Wix image id. */
  async imageBlock(wixImageId, { alt = '', caption = '' } = {}) {
    const assetId = await this.uploadImage(wixImageId)
    if (!assetId) return null
    const block = {
      _type: 'image',
      _key: `img-${wixImageId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}-${this.imageCache.size}`,
      asset: { _type: 'reference', _ref: assetId },
    }
    if (alt) block.alt = alt
    if (caption) block.caption = caption
    return block
  }

  /** Ensure a Sanity category doc exists for a Wix category. Returns its _id. */
  async ensureCategory(wixCategoryId, { label, slug }, order = 0) {
    if (this.categoryRefCache.has(wixCategoryId)) {
      return this.categoryRefCache.get(wixCategoryId)
    }
    const id = `category.wix-${slug}`
    const doc = {
      _id: id,
      _type: 'category',
      title: label,
      slug: { _type: 'slug', current: slug },
      order,
    }
    if (!this.dryRun) {
      // createIfNotExists: never clobber a category an editor may have customised
      await this.client.createIfNotExists(doc)
    }
    this.categoryRefCache.set(wixCategoryId, id)
    return id
  }

  /** Upsert an article. mode: 'replace' (source of truth) | 'skip-existing'. */
  async upsertArticle(doc, mode = 'replace') {
    if (this.dryRun) return { id: doc._id, action: 'dry-run' }
    if (mode === 'skip-existing') {
      await this.client.createIfNotExists(doc)
      return { id: doc._id, action: 'createIfNotExists' }
    }
    await this.client.createOrReplace(doc)
    return { id: doc._id, action: 'createOrReplace' }
  }
}
