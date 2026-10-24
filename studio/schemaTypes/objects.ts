import { defineField, defineType } from 'sanity';

export const link = defineType({
  name: 'link',
  title: 'Lien',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Texte', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'url', title: 'URL', type: 'string', description: 'Lien externe, /page ou #ancre', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'url' } },
});

export const cmsImage = defineType({
  name: 'cmsImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' })],
});
