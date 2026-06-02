import { defineType, defineField } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: () => '📅',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name of the event',
      validation: (rule) => rule.required().min(3).max(150),
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      description: 'A poster or banner image for the event',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      description: 'When does the event take place?',
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket URL',
      type: 'url',
      description: 'Link to the ticket purchase page (if applicable)',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Details about the event — location, what to expect, etc.',
      rows: 5,
    }),
    defineField({
      name: 'isActive',
      title: 'Active / Visible',
      type: 'boolean',
      description: 'Should this event be visible on the site? Turn off for past events',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Event Date, Nearest',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({ title, date, media, isActive }) {
      const formattedDate = date
        ? new Date(date).toLocaleDateString()
        : 'No date set'
      return {
        title,
        subtitle: `${isActive ? '🟢' : '⚪'} ${formattedDate}`,
        media,
      }
    },
  },
})
