import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // News / Articles
      S.listItem()
        .title('News')
        .icon(() => '📰')
        .child(S.documentTypeList('article').title('News Articles')),

      // Videos
      S.listItem()
        .title('Videos')
        .icon(() => '🎬')
        .child(S.documentTypeList('video').title('YouTube Videos')),

      // Programmes
      S.listItem()
        .title('Programmes')
        .icon(() => '📺')
        .child(S.documentTypeList('programme').title('Shows & Series')),

      // Schedule
      S.listItem()
        .title('Schedule')
        .icon(() => '🗓️')
        .child(S.documentTypeList('schedule').title('Daily Programme Guide')),

      // Events
      S.listItem()
        .title('Events')
        .icon(() => '📅')
        .child(S.documentTypeList('event').title('Events')),

      S.divider(),

      // Categories
      S.listItem()
        .title('Categories')
        .icon(() => '🏷️')
        .child(S.documentTypeList('category').title('Content Categories')),

      // Contact form submissions
      S.listItem()
        .title('Messages')
        .icon(() => '✉️')
        .child(
          S.documentTypeList('contactMessage')
            .title('Contact Messages')
            .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
        ),

      // Site Settings — opens as a singleton (no list, directly opens the document)
      S.listItem()
        .title('Site Settings')
        .icon(() => '⚙️')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings')
        ),
    ])
