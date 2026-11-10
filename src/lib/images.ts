import fs from 'node:fs';
import path from 'node:path';

/**
 * Résout automatiquement le chemin d'une image dans public/images/
 * sans avoir à spécifier l'extension (.png, .jpg, .webp, .jpeg, .avif, etc.).
 *
 * Supporte un ou plusieurs noms candidats par ordre de priorité.
 * Insensible à la casse, tolère si une extension ou le préfixe /images/ est déjà présent.
 *
 * Exemple : resolveImage('hero') trouvera automatiquement 'hero.png',
 * 'hero.webp', 'hero.jpg', 'hero.jpeg', etc., quel que soit le format déposé.
 */
export function resolveImage(...baseNames: string[]): string {
  const dir = path.resolve('public/images');

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);

    for (const rawName of baseNames) {
      if (!rawName) continue;
      // Retire une éventuelle extension ou un préfixe /images/ passé en argument
      const clean = rawName
        .replace(/^\/?images\//, '')
        .replace(/\.[^/.]+$/, '')
        .trim()
        .toLowerCase();

      // Recherche insensible à la casse du nom sans extension
      const match = files.find((file) => {
        const ext = path.extname(file);
        const name = path.basename(file, ext).toLowerCase();
        return name === clean && !ext.endsWith('.map');
      });

      if (match) {
        return `/images/${match}`;
      }
    }
  }

  // Fallback propre
  const first = baseNames[0]?.replace(/^\/?images\//, '').replace(/\.[^/.]+$/, '') ?? '';
  return `/images/${first}`;
}

/**
 * Résout automatiquement le chemin d'une vidéo dans public/video/
 * sans avoir à spécifier l'extension (.mp4, .webm, .mov, etc.).
 */
export function resolveVideo(...baseNames: string[]): string {
  const dir = path.resolve('public/video');

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);

    for (const rawName of baseNames) {
      if (!rawName) continue;
      const clean = rawName
        .replace(/^\/?video\//, '')
        .replace(/\.[^/.]+$/, '')
        .trim()
        .toLowerCase();

      const match = files.find((file) => {
        const ext = path.extname(file);
        const name = path.basename(file, ext).toLowerCase();
        return name === clean && !ext.endsWith('.map');
      });

      if (match) {
        return `/video/${match}`;
      }
    }
  }

  const first = baseNames[0]?.replace(/^\/?video\//, '').replace(/\.[^/.]+$/, '') ?? '';
  return `/video/${first}.mp4`;
}
