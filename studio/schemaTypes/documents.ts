import { defineArrayMember, defineField, defineType } from 'sanity';

// Coffret : une carte de la section Coffrets de l'accueil (ordre et choix : Page d'accueil → Coffrets)
export const coffret = defineType({
  name: 'coffret',
  title: 'Coffret',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', description: 'Affiché après le mot « COFFRET » (ex. INITIATION).', validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'Accroche', type: 'string' }),
    defineField({ name: 'price', title: 'Prix (affiché tel quel)', type: 'string', description: 'Ex. « 80€ », « 185 à 305€ », « SUR DEVIS ».' }),
    defineField({
      name: 'services',
      title: 'Prestations incluses',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'service',
          title: 'Prestation',
          fields: [
            defineField({ name: 'title', title: 'Rubrique', type: 'string', description: 'Ex. BIEN ÊTRE, COIFFURE' }),
            defineField({ name: 'detail', title: 'Détail', type: 'text', rows: 2, description: 'Un retour à la ligne = une nouvelle ligne.' }),
          ],
          preview: { select: { title: 'title', subtitle: 'detail' } },
        }),
      ],
    }),
    defineField({ name: 'cta', title: 'Bouton', type: 'link' }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
      description: 'Un élément par paragraphe. Mise en forme : **gras**, *italique* (un paragraphe entièrement en gras est mis en avant).',
    }),
    defineField({ name: 'bigImage', title: 'Grande image', type: 'cmsImage', description: 'Grand format : 1200 px minimum sur le petit côté.' }),
    defineField({ name: 'smallImage', title: 'Petite image', type: 'cmsImage', description: 'Petit format : 800 px minimum sur le petit côté.' }),
    defineField({ name: 'bigVideo', title: 'Grande vidéo (facultatif)', type: 'file', options: { accept: 'video/mp4,video/webm' }, description: 'Utilisée à la place de la grande image pour le 4e coffret (Prestige). MP4, sans son.' }),
  ],
  preview: { select: { title: 'name', subtitle: 'price', media: 'smallImage' } },
});

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal : article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'card', title: 'Carte et référencement' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      description: 'Générée depuis le titre : cliquez sur « Generate ».',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Coiffure', value: 'coiffure' },
          { title: 'Bien-être', value: 'bien-etre' },
          { title: 'Podcast', value: 'podcast' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'publishedAt', title: 'Date de publication', type: 'date', group: 'content', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
      group: 'content',
      options: { list: ['Moussine', 'Violaine', 'July', 'L’équipe Maison Muses'] },
    }),
    defineField({ name: 'cover', title: 'Image de couverture', type: 'cmsImage', group: 'content' }),
    // Podcast uniquement : le fichier audio lu par le player de la page
    defineField({
      name: 'audio',
      title: 'Fichier audio de l’épisode',
      description: 'MP3 de préférence. Visible uniquement pour la catégorie Podcast.',
      type: 'file',
      options: { accept: 'audio/*' },
      group: 'content',
      hidden: ({ document }) => document?.category !== 'podcast',
      validation: (r) =>
        r.custom((value: any, ctx: any) =>
          ctx.document?.category === 'podcast' && !value?.asset ? 'Ajoutez le fichier audio pour que le player s’affiche.' : true,
        ).warning(),
    }),
    defineField({
      name: 'episode',
      title: 'Numéro d’épisode',
      type: 'number',
      group: 'content',
      hidden: ({ document }) => document?.category !== 'podcast',
    }),
    defineField({
      name: 'body',
      title: 'Corps de l’article',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Paragraphe', value: 'normal' },
            { title: 'Introduction (plus grand)', value: 'lead' },
            { title: 'Intertitre', value: 'h2' },
            { title: 'Sous-titre', value: 'h3' },
          ],
          lists: [
            { title: 'Liste à puces', value: 'bullet' },
            { title: 'Liste numérotée', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Lien',
                type: 'object',
                fields: [
                  defineField({ name: 'href', title: 'Adresse (https://… ou /page)', type: 'string', validation: (r) => r.required() }),
                  defineField({ name: 'blank', title: 'Ouvrir dans un nouvel onglet', type: 'boolean', initialValue: false }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          name: 'bodyImage',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' }),
            defineField({ name: 'caption', title: 'Légende', type: 'string' }),
          ],
        },
        {
          type: 'object',
          name: 'quote',
          title: 'Citation',
          fields: [
            defineField({ name: 'text', title: 'Citation', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({ name: 'author', title: 'Auteur de la citation', type: 'string' }),
          ],
          preview: { select: { title: 'text', subtitle: 'author' } },
        },
      ],
    }),
    defineField({ name: 'featured', title: 'À la une', description: 'Mis en avant en haut du journal (le plus récent coché l’emporte).', type: 'boolean', group: 'card', initialValue: false }),
    defineField({ name: 'excerpt', title: 'Résumé', description: 'Affiché sur la carte « À la une » et dans les résultats Google.', type: 'text', rows: 3, group: 'card', validation: (r) => r.max(200) }),
    defineField({ name: 'seoTitle', title: 'Titre pour Google (optionnel)', type: 'string', group: 'card' }),
  ],
  orderings: [{ title: 'Date, plus récents d’abord', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', date: 'publishedAt', category: 'category', media: 'cover' },
    prepare: ({ title, date, category, media }) => ({ title, subtitle: [category, date].filter(Boolean).join(' · '), media }),
  },
});
