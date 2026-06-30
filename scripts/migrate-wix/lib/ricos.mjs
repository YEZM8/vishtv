/**
 * Ricos (Wix rich content) -> Sanity Portable Text.
 *
 * Maps ONLY to the blocks/marks declared in the `article` schema (src/sanity/schemas/article.ts):
 *   styles:  normal, h2, h3, h4, blockquote
 *   marks:   strong (bold), em (italic), link
 *   inline:  image (with alt/caption), youtubeEmbed
 * Anything outside that set is normalised to the nearest allowed form so rendering stays
 * consistent with the site's existing design (the data-only constraint).
 *
 * Image and youtube handling is delegated to callbacks so this module stays pure/sync-agnostic:
 *   onImage(wixImageId, { alt, caption }) -> Promise<portableTextImageBlock | null>
 */

const YT_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

export function extractYouTubeId(url) {
  if (!url) return null
  const m = String(url).match(YT_RE)
  return m ? m[1] : null
}

let counter = 0
function key(prefix, id) {
  if (id && id.length) return id
  counter += 1
  return `${prefix}${counter}`
}

const HEADING_STYLE = (level) => {
  if (level <= 2) return 'h2'
  if (level === 3) return 'h3'
  return 'h4'
}

/** Convert a list of Ricos TEXT nodes into Portable Text spans + markDefs. */
function textNodesToSpans(textNodes, blockKey) {
  const spans = []
  const markDefs = []
  let i = 0
  for (const tn of textNodes || []) {
    if (tn.type !== 'TEXT') continue
    const data = tn.textData || {}
    const text = data.text ?? ''
    const marks = []
    for (const dec of data.decorations || []) {
      if (dec.type === 'BOLD') marks.push('strong')
      else if (dec.type === 'ITALIC') marks.push('em')
      else if (dec.type === 'LINK') {
        const href = dec.linkData?.link?.url || dec.linkData?.url
        if (href) {
          const dk = `${blockKey}l${markDefs.length}`
          markDefs.push({ _key: dk, _type: 'link', href })
          marks.push(dk)
        }
      }
      // UNDERLINE / COLOR / FONT_SIZE etc. -> dropped (not in schema), text preserved
    }
    spans.push({
      _type: 'span',
      _key: `${blockKey}s${i++}`,
      text,
      marks,
    })
  }
  if (spans.length === 0) {
    spans.push({ _type: 'span', _key: `${blockKey}s0`, text: '', marks: [] })
  }
  return { spans, markDefs }
}

function makeBlock(style, textNodes, { listItem, level } = {}) {
  const blockKey = key('b')
  const { spans, markDefs } = textNodesToSpans(textNodes, blockKey)
  const block = {
    _type: 'block',
    _key: blockKey,
    style,
    markDefs,
    children: spans,
  }
  if (listItem) {
    block.listItem = listItem
    block.level = level || 1
  }
  return block
}

/**
 * Transform a Ricos richContent object into an array of Portable Text blocks.
 * @returns {Promise<Array>} portable text array
 */
export async function ricosToPortableText(richContent, { onImage } = {}) {
  counter = 0
  const out = []
  const nodes = richContent?.nodes || []

  async function walk(nodeList, ctx = {}) {
    for (const node of nodeList) {
      switch (node.type) {
        case 'PARAGRAPH':
          out.push(makeBlock('normal', node.nodes, ctx))
          break

        case 'HEADING': {
          const level = node.headingData?.level || 2
          out.push(makeBlock(HEADING_STYLE(level), node.nodes))
          break
        }

        case 'BLOCKQUOTE':
          // BLOCKQUOTE wraps PARAGRAPH children
          for (const child of node.nodes || []) {
            if (child.type === 'PARAGRAPH') out.push(makeBlock('blockquote', child.nodes))
          }
          break

        case 'BULLETED_LIST':
        case 'ORDERED_LIST': {
          const listItem = node.type === 'ORDERED_LIST' ? 'number' : 'bullet'
          const level = (ctx.level || 0) + 1
          for (const li of node.nodes || []) {
            if (li.type !== 'LIST_ITEM') continue
            for (const child of li.nodes || []) {
              if (child.type === 'PARAGRAPH') {
                out.push(makeBlock('normal', child.nodes, { listItem, level }))
              } else if (child.type === 'BULLETED_LIST' || child.type === 'ORDERED_LIST') {
                await walk([child], { level })
              }
            }
          }
          break
        }

        case 'CODE_BLOCK':
          // No code style in schema -> keep text as a normal paragraph
          out.push(makeBlock('normal', node.nodes))
          break

        case 'IMAGE': {
          if (!onImage) break
          const imgId = node.imageData?.image?.src?.id
          const alt = node.imageData?.altText || ''
          const caption = node.imageData?.caption || ''
          const block = await onImage(imgId, { alt, caption })
          if (block) out.push(block)
          break
        }

        case 'VIDEO':
        case 'EMBED':
        case 'APP_EMBED': {
          const url =
            node.videoData?.video?.src?.url ||
            node.videoData?.src?.url ||
            node.embedData?.oembed?.video_url ||
            node.embedData?.src?.url ||
            node.appEmbedData?.url
          const vid = extractYouTubeId(url)
          if (vid) {
            out.push({
              _type: 'youtubeEmbed',
              _key: key('yt'),
              url: `https://www.youtube.com/watch?v=${vid}`,
              videoId: vid,
            })
          }
          break
        }

        // DIVIDER, GIF, HTML, TABLE, GALLERY, etc. -> skipped (not representable in schema)
        default:
          break
      }
    }
  }

  await walk(nodes)
  return out
}
