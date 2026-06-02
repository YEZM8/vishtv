import { defineType, defineField } from 'sanity'

export const programme = defineType({
  name: 'programme',
  title: 'Programme',
  type: 'document',
  icon: () => '📺',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name of the show or series',
      validation: (rule) => rule.required().min(2).max(100),
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
      name: 'poster',
      title: 'Poster Image (2:3)',
      type: 'image',
      description: 'Portrait-style image for programme cards (recommended aspect ratio: 2:3)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image (16:9)',
      type: 'image',
      description: 'Landscape image for banners and lists (recommended aspect ratio: 16:9)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A short summary of what this programme is about',
      rows: 4,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Which category does this programme fall under?',
    }),
    defineField({
      name: 'isActive',
      title: 'Currently Active',
      type: 'boolean',
      description: 'Is this programme still running? Turn off for archived shows',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      media: 'poster',
    },
    prepare({ title, isActive, media }) {
      return {
        title,
        subtitle: isActive ? '🟢 Active' : '⚪ Inactive',
        media,
      }
    },
  },
})
