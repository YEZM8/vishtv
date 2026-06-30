import { defineType, defineField } from 'sanity'

export const contactMessage = defineType({
  name: 'contactMessage',
  title: 'Contact Message',
  type: 'document',
  icon: () => '✉️',
  // Submitted by site visitors via the contact form — read-only in practice.
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 6,
      readOnly: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'isRead',
      title: 'Read',
      type: 'boolean',
      description: 'Mark once you have read/handled this message',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'subject', read: 'isRead' },
    prepare({ title, subtitle, read }) {
      return {
        title: `${read ? '' : '🔵 '}${title || 'Anonymous'}`,
        subtitle: subtitle || 'No subject',
      }
    },
  },
})
