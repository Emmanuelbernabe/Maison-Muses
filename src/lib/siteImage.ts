import { urlFor } from './sanity';

export interface SiteImage {
  src: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
}

const DEFAULT_WIDTHS = [640, 960, 1280, 1600, 2000];

/* Image Sanity si elle est renseignée, sinon fichier local (public/images) */
export function siteImage(image: any, fallback: string, sizes = '100vw', widths = DEFAULT_WIDTHS): SiteImage {
  if (!image?.asset) return { src: fallback };

  const build = (w: number) => urlFor(image).width(w).fit('max').auto('format').quality(100).url();

  return {
    src: build(widths[Math.min(2, widths.length - 1)]),
    srcset: widths.map((w) => `${build(w)} ${w}w`).join(', '),
    sizes,
    alt: image.alt || undefined,
  };
}

/* Tailles d'affichage, avec de la marge pour les cadres en object-fit: cover */
export const SIZES = {
  portrait: '(max-width: 1023px) 100vw, 40vw',
  ambiance: '(max-width: 1023px) 60vw, 18vw',
  thumb: '(max-width: 1023px) 30vw, 15vw',
  team: '(max-width: 1023px) 100vw, 50vw',
  coffretBig: '(max-width: 1023px) 100vw, 40vw',
  coffretSmall: '(max-width: 1023px) 100vw, 25vw',
  door: '(max-width: 1023px) 100vw, 75vw',
};