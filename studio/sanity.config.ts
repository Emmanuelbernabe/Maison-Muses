import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { singletons, structure } from './structure';

const singletonIds = singletons.map((s) => s.id);

export default defineConfig({
  name: 'default',
  title: 'Maison Muses',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((t) => !singletonIds.includes(t.schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) =>
      singletonIds.includes(schemaType) ? prev.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action ?? '')) : prev,
  },
});
