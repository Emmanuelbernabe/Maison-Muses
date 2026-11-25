import { at, defineMigration, unset } from 'sanity/migrate';

// Étape 2 : à lancer UNIQUEMENT après le déploiement du nouveau code du site.
// Supprime les anciennes clés s2/s3/s4, seulement quand la nouvelle clé existe.
const RENAMES = { s2: 'intro', s3: 'gallery', s4: 'team' } as const;

export default defineMigration({
  title: 'Accueil : suppression des anciennes clés photos s2/s3/s4',
  documentTypes: ['homepage'],
  migrate: {
    document(doc) {
      const photos = (doc.photos ?? {}) as Record<string, unknown>;
      return Object.entries(RENAMES)
        .filter(([from, to]) => photos[from] && photos[to])
        .map(([from]) => at(`photos.${from}`, unset()));
    },
  },
});
