import { defineType, defineField } from 'sanity'

export const youtubeEmbed = defineType({
  name: 'youtubeEmbed',
  title: 'YouTube Embed',
  type: 'object',
  description: 'Paste a YouTube URL to embed a video in the article',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      description: 'The full YouTube video URL (e.g. https://www.youtube.com/watch?v=...)',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description: 'Automatically extracted from the URL — do not edit manually',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      url: 'url',
      videoId: 'videoId',
    },
    prepare({ url, videoId }) {
      return {
        title: `YouTube: ${videoId || 'No video ID'}`,
        subtitle: url || 'No URL provided',
      }
    },
  },
})
