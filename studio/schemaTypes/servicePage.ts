import { defineArrayMember, defineField, defineType } from 'sanity';

/* ───────── Pages « Espace coiffure » et « Espace bien-être » ─────────
   Un seul modèle pour les deux pages (même mise en page).
   Chaque onglet correspond à une section de la page, dans l'ordre. */

const paragraphs = (title = 'Paragraphes') =>
  defineField({
    name: 'paragraphs',
    title,
    type: 'array',
    of: [defineArrayMember({ type: 'text', rows: 3 })],
    description: 'Mettre un passage en gras : l’entourer de deux astérisques, **comme ceci**.',
  });

export const servicePage = defineType({
  name: 'servicePage',
  title: 'Page espace',
  type: 'document',
  groups: [
    { name: 'hero', title: '1. Haut de page', default: true },
    { name: 'approach', title: '2. Présentation' },
    { name: 'gallery', title: '3. Galerie' },
    { name: 'accordion', title: '4. Votre visite' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Nom de l’espace', type: 'string', readOnly: true, hidden: true }),

    /* 1. Haut de page */
    defineField({
      name: 'hero',
      title: 'Haut de page',
      type: 'object',
      group: 'hero',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'eyebrow', title: 'Petit texte au-dessus', type: 'string', initialValue: 'L’espace' }),
        defineField({ name: 'title', title: 'Grand titre', type: 'string' }),
        defineField({ name: 'signature', title: 'Petit texte en dessous', type: 'string', description: 'Ex. : par Moussine' }),
        defineField({ name: 'video', title: 'Vidéo de fond', type: 'file', options: { accept: 'video/mp4,video/webm' }, description: 'MP4, idéalement moins de 15 Mo.' }),
        defineField({ name: 'poster', title: 'Image affichée pendant le chargement de la vidéo', type: 'cmsImage' }),
      ],
    }),

    /* 2. Présentation */
    defineField({
      name: 'approach',
      title: 'Présentation',
      type: 'object',
      group: 'approach',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'tag', title: 'Étiquette', type: 'string' }),
        defineField({ name: 'title', title: 'Titre (se remplit au scroll)', type: 'text', rows: 2 }),
        defineField({ name: 'text', title: 'Texte', type: 'text', rows: 4 }),
        defineField({ name: 'ctaLabel', title: 'Texte du bouton', type: 'string' }),
        defineField({ name: 'ctaUrl', title: 'Lien du bouton', type: 'string' }),
        defineField({ name: 'bigImage', title: 'Grande photo', type: 'cmsImage' }),
        defineField({ name: 'smallImage', title: 'Petite photo', type: 'cmsImage' }),
      ],
    }),

    /* 3. Galerie */
    defineField({
      name: 'gallery',
      title: 'Photos du slider',
      description: 'Glissez pour changer l’ordre. 5 à 9 photos conseillées.',
      type: 'array',
      group: 'gallery',
      of: [defineArrayMember({ type: 'cmsImage' })],
      options: { layout: 'grid' },
    }),

    /* 4. Votre visite (accordéon) */
    defineField({
      name: 'steps',
      title: 'Lignes de l’accordéon',
      description: 'La première ligne est ouverte au chargement de la page.',
      type: 'array',
      group: 'accordion',
      of: [
        defineArrayMember({
          name: 'step',
          title: 'Ligne',
          type: 'object',
          fields: [
            defineField({ name: 'tag', title: 'Étiquette', type: 'string' }),
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            paragraphs(),
            defineField({ name: 'ctaLabel', title: 'Texte du bouton (facultatif)', type: 'string' }),
            defineField({ name: 'ctaUrl', title: 'Lien du bouton', type: 'string' }),
            defineField({ name: 'image', title: 'Photo', type: 'cmsImage', description: 'Avec une vidéo : sert d’affiche le temps qu’elle charge.' }),
            defineField({ name: 'video', title: 'Vidéo (facultatif)', type: 'file', options: { accept: 'video/mp4,video/webm' }, description: 'Remplace la photo. MP4 court, idéalement moins de 5 Mo ; joué en boucle, sans son, quand la ligne est ouverte.' }),
          ],
          preview: { select: { title: 'title', subtitle: 'tag', media: 'image' } },
        }),
      ],
    }),
    defineField({
      name: 'brands',
      title: 'Ligne « Nos marques »',
      type: 'object',
      group: 'accordion',
      fields: [
        defineField({ name: 'tag', title: 'Étiquette', type: 'string' }),
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({ name: 'text', title: 'Texte', type: 'text', rows: 4 }),
        defineField({
          name: 'list',
          title: 'Marques (défilent en boucle)',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          description: 'Utilisés seulement si aucun logo n’est renseigné ci-dessous.',
        }),
        defineField({
          name: 'logos',
          title: 'Logos des marques (défilent en boucle)',
          type: 'array',
          description: 'SVG conseillé, déjà à la bonne couleur (orange pour la coiffure, vert pour le bien-être). Remplacent les noms ci-dessus.',
          of: [defineArrayMember({
            type: 'image',
            fields: [defineField({ name: 'alt', title: 'Nom de la marque', type: 'string', validation: (r) => r.required() })],
          })],
        }),
      ],
    }),
    defineField({
      name: 'social',
      title: 'Ligne « Instagram »',
      type: 'object',
      group: 'accordion',
      fields: [
        defineField({ name: 'tag', title: 'Étiquette', type: 'string' }),
        defineField({ name: 'title', title: 'Titre', type: 'string' }),
        defineField({ name: 'text', title: 'Texte', type: 'text', rows: 3 }),
        defineField({ name: 'handle', title: 'Compte affiché', type: 'string', description: 'Ex. : @maison_muses_coiffure' }),
        defineField({ name: 'url', title: 'Lien du compte', type: 'url' }),
      ],
    }),

    /* Référencement */
    defineField({ name: 'seoTitle', title: 'Titre Google', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'Description Google', type: 'text', rows: 3, group: 'seo', validation: (r) => r.max(160) }),
  ],
  preview: { select: { title: 'name' } },
});
