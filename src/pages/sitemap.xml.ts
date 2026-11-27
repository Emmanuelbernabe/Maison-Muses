// Plan du site pour les moteurs de recherche : pages fixes + articles du journal + pages marques
import type { APIRoute } from 'astro';
import { getJournalPosts, getBrandLinks, clean } from '../lib/sanity';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const [posts, brands] = await Promise.all([getJournalPosts(), getBrandLinks()]);
  const url = (path: string) => new URL(path, site).href;
  const entries: { loc: string; lastmod?: string }[] = [
    { loc: url('/') },
    { loc: url('/coiffure/') },
    { loc: url('/bien-etre/') },
    { loc: url('/equipe/') },
    { loc: url('/journal/') },
    { loc: url('/mentions-legales/') },
    { loc: url('/politique-de-confidentialite/') },
    { loc: url('/reserver/coiffure/') },
    { loc: url('/reserver/bien-etre/') },
    ...((posts as any[]) || []).map((p) => ({ loc: url(`/journal/${clean(p.slug)}/`), lastmod: clean(p.publishedAt) || undefined })),
    ...brands.map((b) => ({ loc: url(`${b.url}/`) })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
