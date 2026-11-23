import type { StructureResolver } from 'sanity/structure';

/* ───────── Menu du Studio, rangé comme le site ───────── */

// Documents uniques (une seule page de chaque) : ni création, ni suppression, ni duplication
export const singletons = [
  { id: 'homepage', type: 'homepage', title: 'Accueil' },
  { id: 'page-coiffure', type: 'servicePage', title: 'Espace coiffure' },
  { id: 'page-bien-etre', type: 'servicePage', title: 'Espace bien-être' },
  { id: 'siteSettings', type: 'siteSettings', title: 'Réglages du site' },
];

const page = (S: any, id: string) => {
  const s = singletons.find((x) => x.id === id)!;
  return S.listItem().title(s.title).id(s.id).child(S.document().schemaType(s.type).documentId(s.id).title(s.title));
};

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Maison Muses')
    .items([
      S.listItem()
        .title('Pages du site')
        .id('pages')
        .child(
          S.list()
            .title('Pages du site')
            .items([
              page(S, 'homepage'),
              page(S, 'page-coiffure'),
              page(S, 'page-bien-etre'),
              S.listItem()
                .title('Journal')
                .id('journal')
                .child(S.documentTypeList('journalPost').title('Articles du journal').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Contenus partagés')
        .id('shared')
        .child(
          S.list()
            .title('Contenus partagés')
            .items([
              S.documentTypeListItem('coffret').title('Coffrets'),
              S.documentTypeListItem('member').title('Membres de l’équipe'),
              S.documentTypeListItem('episode').title('Épisodes du podcast'),
              S.documentTypeListItem('article').title('Conseils d’experts (accueil)'),
            ]),
        ),
      S.divider(),
      page(S, 'siteSettings'),
    ]);
