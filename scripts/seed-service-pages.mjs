// ============ PAGES « ESPACE COIFFURE » ET « ESPACE BIEN-ÊTRE » DANS SANITY ============
// Crée (ou remplace) les documents page-coiffure et page-bien-etre avec le contenu actuel du site :
// textes de src/lib/serviceDefaults.ts, photos de public/images, vidéos de public/video.
// Lancement, depuis la racine du projet :
//   node --env-file=.env scripts/seed-service-pages.mjs
// Le .env doit contenir SANITY_PROJECT_ID, SANITY_DATASET et SANITY_WRITE_TOKEN (token « Editor »).

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { SERVICE_DEFAULTS } from '../src/lib/serviceDefaults.ts';

const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
  console.error('✗ SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN manquant dans le .env');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-01-01',
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Premier fichier existant parmi les noms candidats (sans extension, insensible à la casse)
function findFile(dir, ...names) {
  const files = fs.readdirSync(dir);
  for (const n of names) {
    const match = files.find((f) => path.basename(f, path.extname(f)).toLowerCase() === n.toLowerCase());
    if (match) return path.join(dir, match);
  }
  return null;
}

// Un même fichier n'est envoyé qu'une fois (Sanity déduplique aussi de son côté)
const uploaded = new Map();
async function upload(kind, file) {
  if (!uploaded.has(file)) {
    const asset = await client.assets.upload(kind, fs.createReadStream(file), { filename: path.basename(file) });
    console.log(`  ↑ ${path.basename(file)}`);
    uploaded.set(file, asset._id);
  }
  return uploaded.get(file);
}

async function image(keys, alt) {
  const file = findFile('public/images', ...[keys].flat());
  if (!file) {
    console.warn(`  ! image introuvable : ${[keys].flat().join(' / ')}`);
    return undefined;
  }
  return { _type: 'cmsImage', asset: { _type: 'reference', _ref: await upload('image', file) }, ...(alt ? { alt } : {}) };
}

async function video(keys) {
  const file = findFile('public/video', ...keys);
  if (!file) return undefined;
  return { _type: 'file', asset: { _type: 'reference', _ref: await upload('file', file) } };
}

const key = (prefix, i) => `${prefix}${i}`;

async function buildDoc(slug, name) {
  const d = SERVICE_DEFAULTS[slug];
  return {
    _id: `page-${slug}`,
    _type: 'servicePage',
    name,
    hero: {
      eyebrow: d.hero.eyebrow,
      title: d.hero.title,
      signature: d.hero.signature,
      video: await video(d.hero.video),
      poster: await image(d.hero.poster),
    },
    approach: {
      tag: d.approach.tag,
      title: d.approach.title,
      text: d.approach.text,
      ctaLabel: d.approach.ctaLabel,
      ctaUrl: d.approach.ctaUrl,
      bigImage: await image(d.approach.bigImage.key, d.approach.bigImage.alt),
      smallImage: await image(d.approach.smallImage.key, d.approach.smallImage.alt),
    },
    gallery: (await Promise.all(d.gallery.map((g) => image(g.key, g.alt))))
      .map((img, i) => img && { ...img, _key: key('g', i) })
      .filter(Boolean),
    steps: await Promise.all(
      d.steps.map(async (s, i) => ({
        _type: 'step',
        _key: key('s', i),
        tag: s.tag,
        title: s.title,
        paragraphs: s.paragraphs,
        ...(s.ctaLabel ? { ctaLabel: s.ctaLabel, ctaUrl: s.ctaUrl } : {}),
        image: await image(s.image.key, s.image.alt),
      })),
    ),
    brands: { ...d.brands },
    social: { ...d.social },
  };
}

for (const [slug, name] of [['coiffure', 'Espace coiffure'], ['bien-etre', 'Espace bien-être']]) {
  console.log(`→ ${name}`);
  const doc = await buildDoc(slug, name);
  await client.createOrReplace(doc);
  console.log(`✓ ${doc._id} publié`);
}
