// llms.txt : présentation du site pour les assistants IA (format https://llmstxt.org), tirée du contenu Sanity
import type { APIRoute } from 'astro';
import { loadHome, loadSettings } from '../lib/content';
import { getJournalPosts, getBrandLinks, clean } from '../lib/sanity';

export const prerender = true;

const plain = (v: any) => clean(String(v ?? '')).replace(/\*\*|\*/g, '').replace(/\s*\n\s*/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  const [home, settings, posts, brands] = await Promise.all([loadHome(), loadSettings(), getJournalPosts(), getBrandLinks()]);
  const url = (path: string) => new URL(path, site).href;
  const places = settings.footer.places.map((p: any) => `- ${plain(p.name)} : ${plain(p.mapAddress || p.address)}, tél. ${plain(p.phone)}`).join('\n');
  const articles = ((posts as any[]) || []).slice(0, 20).map((p) => `- [${plain(p.title)}](${url(`/journal/${clean(p.slug)}/`)})${p.excerpt ? ` : ${plain(p.excerpt)}` : ''}`).join('\n');
  const txt = `# Maison Muses

> ${plain(home.hero.heading)}. ${plain(home.seoDescription)}

${plain(home.intro.text)}

## Établissements

${places}

## Pages principales

- [Accueil](${url('/')}) : la maison, les coffrets cadeaux, les avis, les routines personnalisées
- [Espace coiffure](${url('/coiffure/')}) : consultation, diagnostic, prestations et réalisations
- [Espace bien-être](${url('/bien-etre/')}) : soins du visage et du corps
- [L’équipe](${url('/equipe/')}) : les fondateurs et praticiens
- [Journal](${url('/journal/')}) : conseils coiffure, rituels bien-être, podcast
${brands.map((b) => `- [${plain(b.name)}](${url(`${b.url}/`)}) : une marque utilisée au salon`).join('\n')}

## Journal (derniers articles)

${articles}
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
