import { defineType, defineField, defineArrayMember } from 'sanity'

export const schedule = defineType({
  name: 'schedule',
  title: 'Schedule',
  type: 'document',
  icon: () => '🗓️',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Which day is this schedule for?',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slots',
      title: 'Time Slots',
      type: 'array',
      description: 'Add the programmes that air on this day in order',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'slot',
          title: 'Time Slot',
          fields: [
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              description: 'Start time in 24h format (e.g. "14:00" or "09:30")',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'programme',
              title: 'Programme',
              type: 'reference',
              to: [{ type: 'programme' }],
              description: 'Which programme airs at this time?',
            }),
            defineField({
              name: 'episodeTitle',
              title: 'Episode Title',
              type: 'string',
              description: 'Optional title for this specific episode or segment',
            }),
            defineField({
              name: 'isLive',
              title: 'Live',
              type: 'boolean',
              description: 'Is this a live broadcast?',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              time: 'time',
              programme: 'programme.title',
              episodeTitle: 'episodeTitle',
              isLive: 'isLive',
            },
            prepare({ time, programme, episodeTitle, isLive }) {
              return {
                title: `${time || '??:??'} — ${programme || 'No programme selected'}`,
                subtitle: `${isLive ? '🔴 LIVE · ' : ''}${episodeTitle || ''}`,
              }
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      date: 'date',
    },
    prepare({ date }) {
      const formatted = date
        ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No date set'
      return {
        title: formatted,
      }
    },
  },
})
