import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID, dataset: process.env.SANITY_STUDIO_DATASET || 'production' },
  // Studio déjà en ligne : les déploiements le mettent à jour au lieu d'en créer un nouveau
  deployment: { appId: 'j9b8pfpnzfk373jpk3ib6cgq' },
});
