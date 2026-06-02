import { defineType, defineField } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: () => '🎬',
  fields: [
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste a YouTube video URL (e.g. https://www.youtube.com/watch?v=...)',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube Video ID',
      type: 'string',
      description: 'Automatically extracted from the URL — do not edit manually',
      readOnly: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of the video as it will appear on the site',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief summary of what this video is about',
      rows: 3,
    }),
    defineField({
      name: 'thumbnailUrl',
      title: 'Thumbnail URL',
      type: 'string',
      description: 'URL of the video thumbnail — usually auto-filled from YouTube',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Which category does this video belong to?',
    }),
    defineField({
      name: 'programme',
      title: 'Programme',
      type: 'reference',
      to: [{ type: 'programme' }],
      description: 'Which show or series is this video part of? (optional)',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Should this video be highlighted on the homepage?',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this video published?',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      description: 'What language is this video in?',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Sinhala', value: 'si' },
        ],
        layout: 'radio',
      },
      initialValue: 'en',
    }),
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      youtubeUrl: 'youtubeUrl',
      isFeatured: 'isFeatured',
    },
    prepare({ title, youtubeUrl, isFeatured }) {
      return {
        title: title || 'Untitled Video',
        subtitle: `${isFeatured ? '⭐ Featured · ' : ''}${youtubeUrl || ''}`,
      }
    },
  },
})
