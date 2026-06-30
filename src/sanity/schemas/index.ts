import { article } from './article'
import { video } from './video'
import { programme } from './programme'
import { category } from './category'
import { event } from './event'
import { schedule } from './schedule'
import { siteSettings } from './siteSettings'
import { contactMessage } from './contactMessage'
import { youtubeEmbed } from './youtube-embed'

export const schemaTypes = [
  // Document types
  article,
  video,
  programme,
  category,
  event,
  schedule,
  siteSettings,
  contactMessage,

  // Object types (used inside other schemas)
  youtubeEmbed,
]
