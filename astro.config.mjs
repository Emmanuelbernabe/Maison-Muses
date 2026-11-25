import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/* Deux sites à partir du même code :
   - le site public : 100 % statique (rapide), republié à chaque publication dans Sanity ;
   - le site d'aperçu (PUBLIC_SANITY_VISUAL_EDITING=true) : rendu à la demande sur Cloudflare,
     pour afficher les brouillons en direct dans l'onglet « Modifier le site » du Studio.
     Construit et déployé avec npm run build:preview / deploy:preview (scripts/preview-site.mjs). */
const preview = process.env.PUBLIC_SANITY_VISUAL_EDITING === 'true';

export default defineConfig({
  site: 'https://maison-muses.fr',
  output: preview ? 'server' : 'static',
  // Dossier à part : le build d'aperçu ne doit jamais écraser le site public (dist/)
  outDir: preview ? './dist-preview' : './dist',
  adapter: preview ? cloudflare() : undefined,
});
