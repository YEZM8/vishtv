'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { structure } from './desk-structure'
import { projectId, dataset } from './env'

export default defineConfig({
  name: 'vishvavahini',
  title: 'Vishvavahini TV',

  // The Studio is embedded in the Next.js app at /studio (app/studio/[[...tool]]).
  // Without this, the router reads "studio" as a tool name → "Tool not found: studio".
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
    }),
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
