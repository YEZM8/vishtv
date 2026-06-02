import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: () => '⚙️',
  fields: [
    defineField({
      name: 'liveStreamVideoId',
      title: 'Live Stream Video ID',
      type: 'string',
      description:
        'YouTube video ID for the live TV stream (the part after "v=" in a YouTube URL, e.g. "dQw4w9WgXcQ")',
    }),
    defineField({
      name: 'radioStreamUrl',
      title: 'Radio Stream URL',
      type: 'url',
      description: 'The URL for the live radio audio stream',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'The main headline shown in the hero section of the homepage',
    }),
    defineField({
      name: 'heroSubline',
      title: 'Hero Subline',
      type: 'string',
      description: 'A short tagline or subtitle below the hero headline',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      description: 'Public email address displayed on the contact page',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
      description: 'Public phone number displayed on the contact page',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      description: 'Links to official social media accounts',
      fields: [
        defineField({
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url',
          description: 'Full URL to the Facebook page',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https'],
            }),
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube URL',
          type: 'url',
          description: 'Full URL to the YouTube channel',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https'],
            }),
        }),
      ],
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      description: 'A dismissible banner at the top of the site for important announcements',
      fields: [
        defineField({
          name: 'text',
          title: 'Announcement Text',
          type: 'string',
          description: 'The message to display in the announcement bar',
        }),
        defineField({
          name: 'link',
          title: 'Link',
          type: 'url',
          description: 'Optional URL the announcement should link to',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https'],
            }),
        }),
        defineField({
          name: 'isVisible',
          title: 'Visible',
          type: 'boolean',
          description: 'Toggle the announcement bar on or off',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
