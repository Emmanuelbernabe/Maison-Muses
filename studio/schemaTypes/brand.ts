import { defineArrayMember, defineField, defineType } from 'sanity';

/* ───────── Pages marques ─────────
   Une marque = une page complète. Pour en ajouter une : ouvrir une marque existante,
   menu « … » en haut à droite → « Dupliquer », changer le contenu, régénérer l'adresse, publier. */

const lines = (name: string, title: string, group: string, description?: string) =>
  defineField({ name, title, description, group, type: 'array', of: [defineArrayMember({ type: 'string' })] });

export const brand = defineType({
  name: 'brand',
  title: 'Marque',
  type: 'document',
  groups: [
    { name: 'hero', title: '1. Haut de page', default: true },
    { name: 'overview', title: '2. La marque' },
    { name: 'products', title: '3. Les produits' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    /* 1. Haut de page */
    defineField({ name: 'name', title: 'Nom de la marque', type: 'string', group: 'hero', description: 'Affiché en très grand. Le premier mot passe sur la première ligne.', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Adresse de la page', type: 'slug', group: 'hero', options: { source: 'name', maxLength: 60 }, description: 'Cliquez sur « Generate ». La page sera /marques/…', validation: (r) => r.required() }),
    defineField({ name: 'intro', title: 'Texte d’introduction', type: 'text', rows: 3, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Grande photo (vue à travers deux fenêtres)', type: 'cmsImage', group: 'hero', description: 'Une photo horizontale fonctionne le mieux.' }),

    /* 2. La marque */
    defineField({ name: 'statement', title: 'Grande phrase', type: 'text', rows: 3, group: 'overview' }),
    lines('origin', 'Origine', 'overview', 'Une ligne par élément.'),
    lines('qualities', 'Qualités', 'overview'),
    defineField({ name: 'overviewImage', title: 'Photo', type: 'cmsImage', group: 'overview' }),

    /* 3. Les produits */
    defineField({ name: 'productsTitle', title: 'Grande phrase', type: 'text', rows: 2, group: 'products' }),
    defineField({ name: 'productsText', title: 'Texte', type: 'text', rows: 3, group: 'products' }),
    defineField({ name: 'salonLabel', title: 'Petit titre de la liste', type: 'string', group: 'products', initialValue: 'Au salon' }),
    lines('salonList', 'Liste', 'products'),
    defineField({
      name: 'products',
      title: 'Produits (slider)',
      description: 'Glissez pour changer l’ordre. Chaque produit s’ouvre en pop-up au clic.',
      type: 'array',
      group: 'products',
      of: [
        defineArrayMember({
          name: 'product',
          title: 'Produit',
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Nom', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'subtitle', title: 'Sous-titre', type: 'string', description: 'Ex. : Tous types de cheveux · 250 ml' }),
            defineField({ name: 'image', title: 'Photo', type: 'cmsImage' }),
            defineField({ name: 'description', title: 'Description (pop-up)', type: 'text', rows: 3 }),
            defineField({
              name: 'specs',
              title: 'Caractéristiques (pop-up)',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'spec',
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Intitulé', type: 'string' }),
                    defineField({ name: 'value', title: 'Valeur', type: 'string' }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'value' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'name', subtitle: 'subtitle', media: 'image' } },
        }),
      ],
    }),
    defineField({ name: 'bookingUrl', title: 'Lien « Réserver un soin »', type: 'url', group: 'products', initialValue: 'https://www.planity.com/' }),

    /* Référencement */
    defineField({ name: 'seoTitle', title: 'Titre Google', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'Description Google', type: 'text', rows: 3, group: 'seo', validation: (r) => r.max(160) }),
  ],
  preview: { select: { title: 'name', subtitle: 'slug.current', media: 'heroImage' } },
});
