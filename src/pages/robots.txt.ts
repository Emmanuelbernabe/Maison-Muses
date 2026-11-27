// Tous les robots (moteurs de recherche et IA) sont autorisés ; indique le plan du site
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
