import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

/* ───────── Liens entre les documents et les pages du site (onglet Présentation) ───────── */
export const resolve: PresentationPluginOptions['resolve'] = {
  // Page affichée → document ouvert à côté
  mainDocuments: defineDocuments([
    { route: '/', filter: `_id == "homepage"` },
    { route: '/coiffure', filter: `_id == "page-coiffure"` },
    { route: '/bien-etre', filter: `_id == "page-bien-etre"` },
    { route: '/marques/:slug', filter: `_type == "brand" && slug.current == $slug` },
    { route: '/journal/:slug', filter: `_type == "journalPost" && slug.current == $slug` },
  ]),
  // Document ouvert → pages où il apparaît
  locations: {
    homepage: defineLocations({ message: 'Page d’accueil', locations: [{ title: 'Accueil', href: '/' }] }),
    servicePage: defineLocations({
      select: { id: '_id' },
      resolve: (doc) => {
        const href = doc?.id?.replace('drafts.', '') === 'page-bien-etre' ? '/bien-etre' : '/coiffure';
        return { locations: [{ title: href === '/coiffure' ? 'Espace coiffure' : 'Espace bien-être', href }] };
      },
    }),
    journalPost: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || 'Article', href: `/journal/${doc?.slug}` },
          { title: 'Journal', href: '/journal' },
        ],
      }),
    }),
    brand: defineLocations({
      select: { name: 'name', slug: 'slug.current' },
      resolve: (doc) => ({ locations: [{ title: doc?.name || 'Marque', href: `/marques/${doc?.slug}` }] }),
    }),
    siteSettings: defineLocations({ message: 'Utilisé sur toutes les pages (header et footer)', locations: [{ title: 'Accueil', href: '/' }] }),
  },
};
