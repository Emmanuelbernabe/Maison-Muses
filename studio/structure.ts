import type { StructureResolver } from 'sanity/structure';

export const singletons = [
  { id: 'homepage', title: 'Page d’accueil' },
  { id: 'siteSettings', title: 'Réglages du site (header & footer)' },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu')
    .items([
      ...singletons.map((s) => S.listItem().title(s.title).id(s.id).child(S.document().schemaType(s.id).documentId(s.id))),
      S.divider(),
      ...S.documentTypeListItems().filter((i) => !singletons.some((s) => s.id === i.getId())),
    ]);
