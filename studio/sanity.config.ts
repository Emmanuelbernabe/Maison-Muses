import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { singletons, structure } from './structure';
import { resolve } from './presentation/resolve';

const singletonIds = singletons.map((s) => s.id);
const singletonTypes = ['homepage', 'siteSettings', 'servicePage'];

export default defineConfig({
  name: 'default',
  title: 'Maison Muses',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    // Onglet « Présentation » : le site d'aperçu s'affiche, on clique pour modifier
    presentationTool({
      title: 'Modifier le site',
      resolve,
      previewUrl: { initial: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321' },
    }),
    structureTool({ title: 'Contenu', structure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Pas de bouton « Créer » pour les pages uniques
    templates: (prev) => prev.filter((t) => !singletonTypes.includes(t.schemaType)),
  },
  document: {
    actions: (prev, { documentId }) =>
      singletonIds.includes(documentId?.replace('drafts.', '') ?? '')
        ? prev.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action ?? ''))
        : prev,
  },
});
