/* ───────── Données structurées (JSON-LD) : lues par Google et les IA ─────────
   Construites à partir du contenu Sanity (établissements du pied de page, logo, articles) :
   rien à saisir en double dans le Studio. */
import { clean, urlFor } from './sanity';

const plain = (v: any) => (typeof v === 'string' ? clean(v).replace(/\*\*|\*/g, '').replace(/\s*\n\s*/g, ' ').trim() : v);
const abs = (path: string, site: URL) => new URL(path, site).href;

/* « 48 Allées Jean Jaurès, 31000 Toulouse, France » → adresse postale structurée */
function postalAddress(full: string) {
  const m = plain(full).match(/^(.*?),\s*(\d{5})\s+([^,]+)(?:,\s*(.+))?$/);
  if (!m) return { '@type': 'PostalAddress', streetAddress: plain(full), addressCountry: 'FR' };
  return { '@type': 'PostalAddress', streetAddress: m[1], postalCode: m[2], addressLocality: m[3], addressCountry: 'FR' };
}

const telephone = (phone: string) => {
  const digits = plain(phone).replace(/\D/g, '');
  return digits.startsWith('0') ? `+33${digits.slice(1)}` : plain(phone);
};

/* Accueil : la marque + ses deux établissements (salon de coiffure, institut de beauté) */
export function businessJsonLd(settings: any, home: any, site: URL) {
  const url = abs('/', site);
  const logo = settings.logo?.image?.url ? plain(settings.logo.image.url) : abs('/favicon.png', site);
  const image = home.hero?.portrait?.image ? urlFor(home.hero.portrait.image).width(1200).auto('format').url() : undefined;
  const sameAs = [...(settings.footer?.socialLinks ?? [])].map((l: any) => plain(l.url)).filter((u: string) => /^https?:\/\//.test(u));
  const brand = { '@id': `${url}#organisation` };

  const places = (settings.footer?.places ?? []).map((p: any, i: number) => {
    const name = plain(p.name);
    const hair = /coiff/i.test(name);
    return {
      '@type': hair ? 'HairSalon' : 'BeautySalon',
      '@id': `${url}#etablissement-${i + 1}`,
      name,
      url: abs(hair ? '/coiffure' : '/bien-etre', site),
      telephone: telephone(p.phone),
      address: postalAddress(p.mapAddress || p.address),
      ...(image ? { image } : {}),
      parentOrganization: brand,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}#organisation`,
        name: 'Maison Muses',
        url,
        logo,
        description: plain(home.seoDescription) || undefined,
        ...(sameAs.length ? { sameAs } : {}),
        subOrganization: places.map((p: any) => ({ '@id': p['@id'] })),
      },
      { '@type': 'WebSite', '@id': `${url}#site`, name: 'Maison Muses', url, inLanguage: 'fr-FR', publisher: brand },
      ...places,
    ],
  };
}

/* Article du journal */
export function articleJsonLd(post: any, pageUrl: string, image: string | undefined, site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': plain(post.category) === 'podcast' ? 'PodcastEpisode' : 'BlogPosting',
    headline: plain(post.title),
    description: plain(post.excerpt) || undefined,
    datePublished: plain(post.publishedAt) || undefined,
    inLanguage: 'fr-FR',
    mainEntityOfPage: pageUrl,
    ...(image ? { image } : {}),
    ...(post.author ? { author: { '@type': 'Person', name: plain(post.author) } } : {}),
    publisher: { '@id': `${abs('/', site)}#organisation`, '@type': 'Organization', name: 'Maison Muses' },
  };
}
