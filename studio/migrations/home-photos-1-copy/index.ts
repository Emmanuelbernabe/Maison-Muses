import { at, defineMigration, setIfMissing } from 'sanity/migrate';

// Étape 1 (24/11/2026) : photos de l'accueil nommées d'après les sections du site.
// photos.s2 -> photos.intro, photos.s3 -> photos.gallery, photos.s4 -> photos.team
// Copie seulement : les anciennes clés restent pour le site déjà en ligne (voir home-photos-2-cleanup).
const RENAMES = { s2: 'intro', s3: 'gallery', s4: 'team' } as const;

export default defineMigration({
  title: 'Accueil : copie des photos s2/s3/s4 vers intro/gallery/team',
  documentTypes: ['homepage'],
  migrate: {
    document(doc) {
      const photos = (doc.photos ?? {}) as Record<string, unknown>;
      return Object.entries(RENAMES)
        .filter(([from, to]) => photos[from] && !photos[to])
        .map(([from, to]) => at(`photos.${to}`, setIfMissing(photos[from])));
    },
  },
});
