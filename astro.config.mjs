import { defineConfig } from 'astro/config';

// Site 100 % statique : un webhook Sanity → build (Netlify / Vercel / Cloudflare) republie le site à chaque publication.
export default defineConfig({
  site: 'https://www.maisonmuses.fr',
});
