import { createClient } from '@sanity/client';
import { stegaClean } from '@sanity/client/stega';
import { createImageUrlBuilder } from '@sanity/image-url';
import { createDataAttribute } from '@sanity/visual-editing-standalone';

/* ───────── Mode « aperçu » (édition visuelle dans le Studio) ─────────
   Activé uniquement sur le site d'aperçu (PUBLIC_SANITY_VISUAL_EDITING=true) :
   on lit les brouillons et on ajoute aux textes des repères invisibles (stega)
   qui permettent au Studio de savoir quel champ ouvrir au clic.
   Le site public, lui, reste statique et ne lit que le contenu publié. */
export const visualEditing = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING === 'true';
const studioUrl = import.meta.env.PUBLIC_SANITY_STUDIO_URL || 'https://maison-muses.sanity.studio';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  // Pas de CDN : le site est généré au build juste après une publication,
  // le CDN pourrait encore servir l'ancienne version du contenu
  useCdn: false,
  ...(visualEditing
    ? {
        perspective: 'drafts' as const,
        token: import.meta.env.SANITY_API_READ_TOKEN,
        stega: { enabled: true, studioUrl },
      }
    : {}),
});

// À utiliser pour toute valeur qui n'est pas du texte affiché (lien, classe, attribut alt, comparaison…)
export const clean = <T,>(value: T): T => stegaClean(value);

// Repère cliquable pour ce qui ne porte pas de texte (images, vidéos) : seulement en mode aperçu
export const sanityAttr = (id: string | undefined, type: string, path: string) =>
  visualEditing && id
    ? createDataAttribute({ baseUrl: studioUrl, id: id.replace('drafts.', ''), type, path }).toString()
    : undefined;

const builder = createImageUrlBuilder(client);
export const urlFor = (source: any) => builder.image(source);

const link = `{ label, url }`;
const video = (field: string) => `"${field}": ${field}.asset->url`;

/* ───────── Accueil (structure et valeurs par défaut : lib/content.ts) ───────── */
export const getHome = () =>
  client.fetch(`*[_id == "homepage"][0]{
    seoTitle, seoDescription,
    loader,
    hero { subtitle, ${video('video')}, portrait, reveal, center },
    intro { title, text, ctaBienEtre ${link}, ctaCoiffure ${link}, image, ${video('video')} },
    gallery,
    team { title, text, cta ${link}, thumb, left, mid, right },
    coffrets {
      title, text, prefix,
      items[]->{ _id, name, tagline, price, services[]{ title, detail }, cta ${link}, description, bigImage, smallImage, ${video('bigVideo')} }
    },
    reviews { title, rating, ratingLabel, cta ${link}, items[]{ quote, author, service } },
    routines { title, text, prefix, ctaLabel, doors[]{ label, text, url, embedUrl, image } },
    journal { title, cta ${link}, filterAll, filterArticles, filterPodcast }
  }`);

/* ───────── Réglages : logo, header, menu, footer, textes communs ───────── */
export const getSettings = () =>
  client.fetch(`*[_id == "siteSettings"][0]{
    logo { ..., "url": asset->url },
    header { menuLabel, reserve ${link} },
    menu[]{ label, url, brands },
    footer {
      title, cta ${link},
      places[]{ name, address, phone, mapAddress },
      maisonTitle, maisonLinks[]${link},
      socialTitle, socialLinks[]${link},
      copyright, legalLinks[]${link}
    },
    brandLabels
  }`);

/* ───────── Page L'équipe ───────── */
export const getEquipePage = () =>
  client.fetch(`*[_id == "page-equipe"][0]{
    seoTitle, seoDescription,
    hero { title, word, text, tagline, ${video('video')}, poster, playLabel },
    members[]{ name, role, tag, lead, bio, cta ${link}, imageMain, imageSecond }
  }`);

/* ───────── Textes des pages journal ───────── */
export const getJournalPage = () =>
  client.fetch(`*[_id == "page-journal"][0]{
    seoTitle, seoDescription, titleItalic, titleMain, allLabel, featuredLabel, emptyText,
    backLabel, cta ${link}, relatedTitleStart, relatedTitleEnd
  }`);

/* ───────── Journal ───────── */
// « chars » : longueur du texte, pour estimer le temps de lecture
const journalCard = `_id, title, "slug": slug.current, category, publishedAt, author, cover, excerpt, featured, episode, "chars": length(pt::text(body))`;

export const getJournalPosts = () =>
  client.fetch(`*[_type == "journalPost" && defined(slug.current)] | order(publishedAt desc){ ${journalCard} }`);

export const getJournalPost = (slug: string) =>
  client.fetch(`*[_type == "journalPost" && slug.current == $slug][0]{ ${journalCard}, seoTitle, body, "audio": audio.asset->{ url, mimeType } }`, { slug });

/* ───────── Pages espace coiffure / bien-être ───────── */
export const getServicePage = (id: 'page-coiffure' | 'page-bien-etre') =>
  client.fetch(`*[_id == $id][0]{
    _id, _type, seoTitle, seoDescription,
    hero { eyebrow, title, signature, "video": video.asset->url, poster },
    approach,
    gallery,
    steps[]{ _key, tag, title, paragraphs, ctaLabel, ctaUrl, image, "video": video.asset->url },
    brands,
    social
  }`, { id });

/* ───────── Pages marques ───────── */
const brandFields = `_id, _type, name, "slug": slug.current, intro, heroImage, statement, origin, qualities, overviewImage,
  productsTitle, productsText, salonLabel, salonList, bookingUrl, seoTitle, seoDescription,
  products[]{ _key, name, subtitle, image, description, specs[]{ label, value } }`;

export const getBrands = () =>
  client.fetch(`*[_type == "brand" && defined(slug.current)] | order(name asc){ ${brandFields} }`);

// Menu « Nos marques » : chaque marque publiée apparaît automatiquement
export const getBrandLinks = async (): Promise<{ name: string; url: string }[]> => {
  const brands: any[] = (await client.fetch(`*[_type == "brand" && defined(slug.current)] | order(name asc){ name, "slug": slug.current }`)) || [];
  return brands.map((b) => ({ name: clean(b.name), url: `/marques/${clean(b.slug)}` }));
};

export const getBrand = (slug: string) =>
  client.fetch(`*[_type == "brand" && slug.current == $slug][0]{ ${brandFields} }`, { slug });
