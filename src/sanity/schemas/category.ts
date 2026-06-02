import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name of the category (e.g. "News", "Entertainment", "Worship")',
      validation: (rule) => rule.required().min(1).max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title — click "Generate" to create automatically',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon (Emoji)',
      type: 'string',
      description: 'A single emoji to represent this category (e.g. 📰, 🎵, 🙏)',
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first in menus and navigation',
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
      order: 'order',
    },
    prepare({ title, icon, order }) {
      return {
        title: `${icon || '🏷️'} ${title}`,
        subtitle: order != null ? `Order: ${order}` : undefined,
      }
    },
  },
})
