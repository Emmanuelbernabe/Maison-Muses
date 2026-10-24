import { defineArrayMember, defineField, defineType } from 'sanity';

export const coffret = defineType({
  name: 'coffret',
  title: 'Coffret',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'Accroche', type: 'string' }),
    defineField({ name: 'price', title: 'Prix (affiché tel quel)', type: 'string', description: 'Ex. « 80 € », « 185 à 305 € », « Sur devis »' }),
    defineField({
      name: 'includes',
      title: 'Ce qui est inclus',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Rubrique', type: 'string', description: 'Ex. Bien-être, Coiffure' }),
            defineField({ name: 'title', title: 'Prestation', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'image', title: 'Image (carrée)', type: 'cmsImage' }),
    defineField({ name: 'ctaLabel', title: 'Texte du bouton', type: 'string', initialValue: 'Réserver' }),
    defineField({ name: 'ctaUrl', title: 'Lien de réservation', type: 'string' }),
  ],
  preview: { select: { title: 'name', subtitle: 'price', media: 'image' } },
});

export const member = defineType({
  name: 'member',
  title: 'Membre de l’équipe',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Prénom', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'tag', title: 'Tag', type: 'string', description: 'Ex. #Muses Coiffure' }),
    defineField({ name: 'photo', title: 'Portrait (4/5)', type: 'cmsImage' }),
  ],
  preview: { select: { title: 'name', subtitle: 'tag', media: 'photo' } },
});

export const article = defineType({
  name: 'article',
  title: 'Conseil d’expert',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'url', title: 'URL de l’article', type: 'string' }),
    defineField({ name: 'linkLabel', title: 'Texte du lien', type: 'string', initialValue: 'Lire l’article' }),
  ],
});

export const episode = defineType({
  name: 'episode',
  title: 'Épisode du podcast',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'DD/MM/YYYY' } }),
    defineField({ name: 'url', title: 'URL de l’épisode', type: 'string' }),
  ],
  orderings: [{ title: 'Plus récent', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
