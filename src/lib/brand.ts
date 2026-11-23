import { clean, sanityAttr } from './sanity';
import { serviceImage } from './servicePage';

/* ───────── Pages marques : contenu Sanity prêt à afficher ─────────
   Une photo manquante est remplacée par une photo du site, la page reste présentable. */
const BRAND_FALLBACKS = ['prestige-little', 'harmonie-little', 'soin-img', 'symbiose-little', 'marquee-4', 'load-3', 'marquee-6', 'follow-1'];

export function buildBrandPage(doc: any) {
  const attr = (path: string) => sanityAttr(doc?._id, 'brand', path);
  const name = String(doc?.name || '');
  // Titre sur deux lignes : le premier mot, puis le reste (« Lysor » / « Liane »)
  const [first, ...rest] = name.split(' ');
  const products = (doc?.products || []).map((p: any, i: number) => {
    const image = serviceImage(p.image, { key: BRAND_FALLBACKS[i % BRAND_FALLBACKS.length], alt: clean(p.name) }, 1400);
    return {
      title: p.name,
      subtitle: p.subtitle,
      src: image.src,
      alt: image.alt,
      attr: attr(`products[_key=="${p._key}"]`),
      // Données de la pop-up (texte nettoyé : elles passent par un attribut JSON)
      modal: {
        name: clean(p.name),
        subtitle: clean(p.subtitle) || '',
        description: clean(p.description) || '',
        specs: (p.specs || []).map((s: any) => [clean(s.label), clean(s.value)]),
        src: image.src,
        alt: image.alt,
      },
    };
  });

  return {
    name,
    titleLines: rest.length ? [first, rest.join(' ')] : [first],
    intro: doc?.intro,
    hero: { ...serviceImage(doc?.heroImage, { key: 'prestige-little', alt: clean(name) }, 2400), attr: attr('heroImage') },
    statement: doc?.statement,
    origin: doc?.origin || [],
    qualities: doc?.qualities || [],
    overviewImage: { ...serviceImage(doc?.overviewImage, { key: 'harmonie-little', alt: clean(name) }, 1600), attr: attr('overviewImage') },
    productsTitle: doc?.productsTitle,
    productsText: doc?.productsText,
    salonLabel: doc?.salonLabel || 'Au salon',
    salonList: doc?.salonList || [],
    products,
    bookingUrl: clean(doc?.bookingUrl) || 'https://www.planity.com/',
    seoTitle: clean(doc?.seoTitle),
    seoDescription: clean(doc?.seoDescription),
  };
}
