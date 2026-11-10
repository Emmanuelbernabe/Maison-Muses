import { defineArrayMember, defineField, defineType } from 'sanity';

const group = (name: string, title: string, fields: any[]) =>
  defineField({ name, title, type: 'object', options: { collapsible: true, collapsed: false }, fields });

const ref = (to: string) => defineArrayMember({ type: 'reference', to: [{ type: to }] });

const sub = (name: string, title: string, fields: any[]) =>
  defineField({ name, title, type: 'object', options: { collapsible: true, collapsed: true }, fields });

const BIG = 'Grand portrait : 1200 px minimum sur le petit côté.';
const SMALL = 'Petite image : 800 px minimum sur le petit côté.';
const photo = (name: string, title: string, description = BIG) =>
  defineField({ name, title, type: 'cmsImage', description });

export const homepage = defineType({
  name: 'homepage',
  title: 'Page d’accueil',
  type: 'document',
  fields: [
    defineField({ name: 'seoTitle', title: 'Titre SEO', type: 'string', validation: (r) => r.max(60) }),
    defineField({ name: 'seoDescription', title: 'Description SEO', type: 'text', rows: 2, validation: (r) => r.max(160) }),

    group('hero', 'Hero', [
      defineField({ name: 'image', title: 'Image (affichée en noir & blanc)', type: 'cmsImage' }),
      defineField({ name: 'subtitle', title: 'Sous-titre', type: 'string' }),
      defineField({ name: 'title', title: 'Grand titre', type: 'string', description: 'Reste sur une seule ligne : 14 caractères max.', validation: (r) => r.required().max(14) }),
    ]),

    group('photos', 'Photos du site', [
      sub('loader', 'Loader', [
        photo('load1', 'Photo 1'),
        photo('load2', 'Photo 2'),
        photo('load3', 'Photo 3'),
        photo('load4', 'Photo 4'),
      ]),
      sub('hero', 'Hero', [
        photo('portrait', 'Portrait du hero', `${BIG} Aussi utilisé à la fin du loader.`),
        photo('reveal', 'Portrait révélé au scroll', `${BIG} Apparaît sur le portrait du hero puis reste en section 2.`),
        photo('center', 'Portrait central du marquee', `${BIG} Fait le relais entre la section 2 et le marquee de la section 3.`),
      ]),
      sub('s2', 'Section 2 : coiffure et bien-être', [
        photo('ambiance', 'Image ambiance', SMALL),
      ]),
      sub('s3', 'Section 3 : marquee', [
        defineField({
          name: 'marquee',
          title: 'Photos du marquee',
          type: 'array',
          of: [defineArrayMember({ type: 'cmsImage' })],
          description: `5 photos, placées autour du portrait central. ${BIG}`,
          validation: (r) => r.max(5),
        }),
      ]),
      sub('s4', 'Section 4 : équipe', [
        photo('thumb', 'Vignette du titre', SMALL),
        photo('teamLeft', 'Photo équipe gauche'),
        photo('teamMid', 'Photo équipe centre'),
        photo('teamRight', 'Photo équipe droite'),
      ]),
      sub('coffrets', 'Section 5 : coffrets', [
        photo('initiationBig', 'Initiation, grande image'),
        photo('initiationSmall', 'Initiation, petite image', SMALL),
        photo('harmonieBig', 'Harmonie, grande image'),
        photo('harmonieSmall', 'Harmonie, petite image', SMALL),
        photo('symbioseBig', 'Symbiose, grande image'),
        photo('symbioseSmall', 'Symbiose, petite image', SMALL),
        photo('prestigeSmall', 'Prestige, petite image', `${SMALL} La grande reste la vidéo.`),
      ]),
      sub('routines', 'Section 7 : routines', [
        photo('coiffure', 'Porte routine coiffure'),
        photo('bienEtre', 'Porte routine bien-être'),
      ]),
    ]),

    group('intro', 'Introduction', [
      defineField({ name: 'title', title: 'Titre', type: 'string' }),
      defineField({ name: 'text', title: 'Texte', type: 'text', rows: 5 }),
      defineField({ name: 'gallery', title: 'Mosaïque photos', type: 'array', of: [defineArrayMember({ type: 'cmsImage' })], validation: (r) => r.max(10) }),
    ]),

    group('coffrets', 'Section coffrets', [
      defineField({ name: 'title', title: 'Titre', type: 'string' }),
      defineField({ name: 'tag', title: 'Tag', type: 'string' }),
      defineField({ name: 'text', title: 'Texte', type: 'text', rows: 3 }),
      defineField({ name: 'items', title: 'Coffrets (dans l’ordre d’affichage)', type: 'array', of: [ref('coffret')], description: 'Le premier coffret avec un détail s’ouvre par défaut.' }),
    ]),

    group('mission', 'Mission & équipe', [
      defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
      defineField({ name: 'title', title: 'Titre', type: 'string' }),
      defineField({ name: 'text', title: 'Texte', type: 'text', rows: 4 }),
      defineField({ name: 'primaryCta', title: 'Lien principal', type: 'link' }),
      defineField({ name: 'secondaryCta', title: 'Lien secondaire', type: 'link' }),
      defineField({ name: 'team', title: 'Équipe', type: 'array', of: [ref('member')] }),
    ]),

    group('reviews', 'Avis', [
      defineField({ name: 'score', title: 'Note', type: 'string', description: 'Ex. 5/5' }),
      defineField({ name: 'source', title: 'Source', type: 'string', description: 'Ex. sur Planity' }),
      defineField({ name: 'quotes', title: 'Avis (sans guillemets)', type: 'array', of: [defineArrayMember({ type: 'text', rows: 3 })] }),
    ]),

    group('routine', 'Routine, conseils & podcast', [
      defineField({ name: 'title', title: 'Titre', type: 'string' }),
      defineField({ name: 'text', title: 'Texte', type: 'text', rows: 3 }),
      defineField({
        name: 'diagnostics',
        title: 'Cartes de diagnostic',
        type: 'array',
        validation: (r) => r.max(2),
        of: [
          defineArrayMember({
            type: 'object',
            fields: [
              defineField({ name: 'title', title: 'Titre', type: 'string' }),
              defineField({ name: 'ctaLabel', title: 'Texte du lien', type: 'string', initialValue: 'Commencer' }),
              defineField({ name: 'url', title: 'URL', type: 'string' }),
            ],
            preview: { select: { title: 'title', subtitle: 'url' } },
          }),
        ],
      }),
      defineField({
        name: 'advice',
        title: 'Conseils d’experts',
        type: 'object',
        fields: [defineField({ name: 'title', title: 'Titre', type: 'string' }), defineField({ name: 'items', title: 'Articles', type: 'array', of: [ref('article')] })],
      }),
      defineField({
        name: 'podcast',
        title: 'Podcast',
        type: 'object',
        fields: [defineField({ name: 'title', title: 'Titre', type: 'string' }), defineField({ name: 'items', title: 'Épisodes', type: 'array', of: [ref('episode')] })],
      }),
    ]),
  ],
  preview: { prepare: () => ({ title: 'Page d’accueil' }) },
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  fields: [
    defineField({ name: 'logo', title: 'Logo (texte)', type: 'string' }),
    defineField({ name: 'headerCta', title: 'Bouton du header', type: 'link' }),
    group('footer', 'Footer', [
      defineField({ name: 'title', title: 'Grand titre', type: 'string' }),
      defineField({ name: 'cta', title: 'Lien sous le titre', type: 'link' }),
      defineField({
        name: 'spaces',
        title: 'Établissements',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            fields: [
              defineField({ name: 'title', title: 'Titre', type: 'string' }),
              defineField({ name: 'details', title: 'Adresse, horaires, téléphone', type: 'text', rows: 5, description: 'Un retour à la ligne = une nouvelle ligne sur le site.' }),
            ],
            preview: { select: { title: 'title' } },
          }),
        ],
      }),
      defineField({
        name: 'newsletter',
        title: 'Newsletter',
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Titre', type: 'string' }),
          defineField({ name: 'text', title: 'Texte', type: 'string' }),
          defineField({ name: 'cta', title: 'Lien', type: 'link' }),
        ],
      }),
      defineField({ name: 'socialsTitle', title: 'Titre réseaux', type: 'string' }),
      defineField({
        name: 'socials',
        title: 'Réseaux',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            fields: [
              defineField({ name: 'label', title: 'Nom', type: 'string' }),
              defineField({ name: 'handle', title: 'Identifiant', type: 'string' }),
              defineField({ name: 'url', title: 'URL (optionnel)', type: 'url' }),
            ],
            preview: { select: { title: 'label', subtitle: 'handle' } },
          }),
        ],
      }),
      defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
      defineField({ name: 'legal', title: 'Lien légal', type: 'link' }),
    ]),
  ],
  preview: { prepare: () => ({ title: 'Réglages du site' }) },
});