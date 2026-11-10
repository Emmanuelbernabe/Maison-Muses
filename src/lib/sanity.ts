import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
});

const builder = createImageUrlBuilder(client);
export const urlFor = (source: any) => builder.image(source);

const link = `{ label, url }`;

export const getHome = () =>
  client.fetch(`*[_id == "homepage"][0]{
    seoTitle, seoDescription,
    photos,
    hero { subtitle, title, image },
    intro { title, text, gallery, soins[]{ label, url } },
    coffrets {
      title, tag, text,
      items[]->{ _id, name, tagline, price, includes, description, image, ctaLabel, ctaUrl }
    },
    mission {
      eyebrow, title, text,
      primaryCta ${link}, secondaryCta ${link},
      team[]->{ _id, name, tag, photo }
    },
    reviews { score, source, quotes },
    routine {
      title, text,
      diagnostics[]{ title, ctaLabel, url },
      advice { title, items[]->{ _id, title, url, linkLabel } },
      podcast { title, items[]->{ _id, title, url, date } }
    }
  }`);

export const getSettings = () =>
  client.fetch(`*[_id == "siteSettings"][0]{
    logo, headerCta ${link},
    footer {
      title, cta ${link},
      spaces[]{ title, details },
      newsletter { title, text, cta ${link} },
      socialsTitle, socials[]{ label, handle, url },
      copyright, legal ${link}
    }
  }`);
