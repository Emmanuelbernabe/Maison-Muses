import { defineField, defineType } from 'sanity';

/* ══════════════════════ PAGES LÉGALES (mentions légales, politique de confidentialité) ══════════════════════ */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Page légale',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre de la page', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'updatedAt', title: 'Dernière mise à jour', type: 'date', options: { dateFormat: 'DD/MM/YYYY' } }),
    defineField({
      name: 'body',
      title: 'Texte',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Paragraphe', value: 'normal' },
            { title: 'Intertitre', value: 'h2' },
            { title: 'Sous-titre', value: 'h3' },
          ],
          lists: [{ title: 'Liste à puces', value: 'bullet' }],
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
                  defineField({ name: 'href', title: 'Adresse (https://…, mailto:… ou /page)', type: 'string', validation: (r) => r.required() }),
                  defineField({ name: 'blank', title: 'Ouvrir dans un nouvel onglet', type: 'boolean', initialValue: false }),
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({ name: 'seoDescription', title: 'Description pour Google', type: 'text', rows: 2, validation: (r) => r.max(160) }),
  ],
  preview: { select: { title: 'title' } },
});
