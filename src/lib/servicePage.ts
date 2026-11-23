import { urlFor, sanityAttr, clean } from './sanity';
import { resolveImage, resolveVideo } from './images';
import { SERVICE_DEFAULTS } from './serviceDefaults';

/* ───────── Pages espace : contenu Sanity + valeurs par défaut ─────────
   Chaque champ vide dans Sanity reprend le contenu par défaut, la page n'est jamais vide. */

const filled = (v: any) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && clean(v) !== '');
const pick = (a: any, b: any) => (filled(a) ? a : b);

// Image Sanity si présente, sinon photo locale par défaut
export function serviceImage(image: any, fallback: { key: string; alt?: string } | undefined, width = 1400) {
  if (image?.asset) {
    return { src: urlFor(image).width(width).fit('max').auto('format').quality(80).url(), alt: clean(image.alt) || clean(fallback?.alt) || '' };
  }
  return { src: resolveImage(fallback?.key || 'marquee-1'), alt: fallback?.alt || '' };
}

export function buildServicePage(slug: 'coiffure' | 'bien-etre', doc: any) {
  const d = SERVICE_DEFAULTS[slug];
  const id = doc?._id;
  const attr = (path: string) => sanityAttr(id, 'servicePage', path);
  const h = doc?.hero || {};
  const a = doc?.approach || {};

  const hero = {
    eyebrow: pick(h.eyebrow, d.hero.eyebrow),
    title: pick(h.title, d.hero.title),
    signature: pick(h.signature, d.hero.signature),
    video: h.video || resolveVideo(d.hero.video[0], d.hero.video[1]),
    poster: serviceImage(h.poster, { key: d.hero.poster[0] }).src,
    videoAttr: attr('hero.video'),
  };

  const approach = {
    tag: pick(a.tag, d.approach.tag),
    title: pick(a.title, d.approach.title),
    text: pick(a.text, d.approach.text),
    ctaLabel: pick(a.ctaLabel, d.approach.ctaLabel),
    ctaUrl: clean(pick(a.ctaUrl, d.approach.ctaUrl)),
    big: { ...serviceImage(a.bigImage, d.approach.bigImage), attr: attr('approach.bigImage') },
    small: { ...serviceImage(a.smallImage, d.approach.smallImage, 900), attr: attr('approach.smallImage') },
  };

  const gallery = filled(doc?.gallery)
    ? doc.gallery.map((img: any) => ({ ...serviceImage(img, undefined, 1600), attr: attr(`gallery[_key=="${img._key}"]`) }))
    : d.gallery.map((g: any) => ({ src: resolveImage(g.key), alt: g.alt }));

  const steps = (filled(doc?.steps) ? doc.steps : d.steps).map((s: any, i: number) => ({
    tag: s.tag,
    title: s.title,
    paragraphs: s.paragraphs || [],
    ctaLabel: s.ctaLabel,
    ctaUrl: clean(s.ctaUrl),
    image: { ...serviceImage(s.image, d.steps[i]?.image), attr: s._key ? attr(`steps[_key=="${s._key}"].image`) : undefined },
  }));

  const b = doc?.brands || {};
  const brands = { tag: pick(b.tag, d.brands.tag), title: pick(b.title, d.brands.title), text: pick(b.text, d.brands.text), list: pick(b.list, d.brands.list) };

  const so = doc?.social || {};
  const social = { tag: pick(so.tag, d.social.tag), title: pick(so.title, d.social.title), text: pick(so.text, d.social.text), handle: pick(so.handle, d.social.handle), url: clean(pick(so.url, d.social.url)) };

  return { hero, approach, gallery, steps, brands, social, seoTitle: clean(doc?.seoTitle), seoDescription: clean(doc?.seoDescription) };
}
