import { toHTML, escapeHTML } from '@portabletext/to-html';
import { urlFor } from './sanity';
import { resolveImage } from './images';

/* ───────── Helpers du journal ───────── */

export const JOURNAL_CATEGORIES = [
  { value: 'coiffure', label: 'Coiffure' },
  { value: 'bien-etre', label: 'Bien-être' },
  { value: 'podcast', label: 'Podcast' },
];

export const journalCategoryLabel = (value?: string) =>
  JOURNAL_CATEGORIES.find((c) => c.value === value)?.label ?? 'Journal';

export const journalDate = (date?: string, short = false) =>
  date
    ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: short ? 'short' : 'long', year: 'numeric' })
    : '';

// ~1 100 caractères par minute de lecture
export const journalReadingTime = (chars?: number) => Math.max(1, Math.round((chars || 0) / 1100));

// Image de couverture : Sanity si renseignée, sinon une photo locale selon la catégorie
const JOURNAL_FALLBACKS: Record<string, string> = {
  coiffure: 'marquee-1',
  'bien-etre': 'soin-img',
  podcast: 'marquee-4',
};

export function journalCover(post: any, width = 1200) {
  if (post?.cover?.asset) {
    const build = (w: number) => urlFor(post.cover).width(w).fit('max').auto('format').quality(80).url();
    return {
      src: build(width),
      srcset: [480, 800, 1200, 1800].map((w) => `${build(w)} ${w}w`).join(', '),
      alt: post.cover.alt || '',
    };
  }
  return { src: resolveImage(JOURNAL_FALLBACKS[post?.category] || 'marquee-1'), srcset: undefined, alt: '' };
}

/* ───────── Corps de l'article : Portable Text → HTML (styles dans JournalBody.astro) ───────── */
export function journalBodyHtml(body: any[] = []) {
  return toHTML(body, {
    components: {
      block: {
        lead: ({ children }) => `<p class="lead">${children}</p>`,
      },
      marks: {
        link: ({ children, value }) => {
          const href = escapeHTML(value?.href || '#');
          const blank = value?.blank ? ' target="_blank" rel="noopener"' : '';
          return `<a href="${href}"${blank}>${children}</a>`;
        },
      },
      types: {
        bodyImage: ({ value }) => {
          if (!value?.asset) return '';
          const src = urlFor(value).width(1400).fit('max').auto('format').quality(80).url();
          const caption = value.caption ? `<figcaption>${escapeHTML(value.caption)}</figcaption>` : '';
          return `<figure><div class="photo" data-jr-clip><img src="${src}" alt="${escapeHTML(value.alt || '')}" loading="lazy" decoding="async" /></div>${caption}</figure>`;
        },
        quote: ({ value }) => {
          const cite = value?.author ? `<cite>${escapeHTML(value.author)}</cite>` : '';
          return `<blockquote>« ${escapeHTML(value?.text || '')} »${cite}</blockquote>`;
        },
      },
    },
  });
}
