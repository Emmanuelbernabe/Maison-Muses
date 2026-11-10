// ============ IMPORT DES PHOTOS DANS SANITY ============
// Envoie les images de public/images dans Sanity et remplit « Photos du site » de la page d'accueil.
// Lancement, depuis la racine du projet :
//   node --env-file=.env scripts/upload-photos.mjs
// Le .env doit contenir SANITY_PROJECT_ID, SANITY_DATASET et SANITY_WRITE_TOKEN (token « Editor »).

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

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

const IMAGES_DIR = path.resolve('public/images');
const MAX_MB = 8;

// ============ CORRESPONDANCE CHAMP → FICHIER LOCAL ============
// [chemin du champ, nom du fichier sans extension, texte alternatif]
const photos = [
  ['loader.load1', 'load-1', 'Coiffure au salon Maison Muses'],
  ['loader.load2', 'load-2', 'Coiffure au salon Maison Muses'],
  ['loader.load3', 'load-3', 'Massage du visage à Maison Muses Bien-être'],
  ['loader.load4', 'load-4', 'Coiffure au salon Maison Muses'],
  ['hero.portrait', 'hero', 'Cliente de Maison Muses, cheveux longs ondulés'],
  ['hero.reveal', 'follow-1', 'Cliente de Maison Muses, balayage blond'],
  ['hero.center', 'marquee-follow-img', 'Coiffeur Maison Muses en pleine coupe'],
  ['s2.ambiance', 'ambiance-img', 'Ambiance de l’espace bien-être Maison Muses'],
  ['s4.thumb', 's4-thumb', 'Prestations soin Maison Muses'],
  ['s4.teamLeft', 's4-team-left', 'L’équipe Maison Muses'],
  ['s4.teamMid', 's4-team-mid', 'Moussine et July'],
  ['s4.teamRight', 's4-team-right', 'Violaine'],
  ['coffrets.initiationBig', 'initiation-big', 'Massage relaxant, coffret Initiation'],
  ['coffrets.initiationSmall', 'initiation-little', 'Coiffure, coffret Initiation'],
  ['coffrets.harmonieBig', 'harmonie-big', 'Coiffure, coffret Harmonie'],
  ['coffrets.harmonieSmall', 'harmonie-little', 'Soins, coffret Harmonie'],
  ['coffrets.symbioseBig', 'symbiose-big', 'Coiffure, coffret Symbiose'],
  ['coffrets.symbioseSmall', 'symbiose-little', 'Soin, coffret Symbiose'],
  ['coffrets.prestigeSmall', 'prestige-little', 'Soins, coffret Prestige'],
  ['routines.coiffure', 'marquee-1', 'Cheveux longs blonds ondulés au salon Maison Muses'],
  ['routines.bienEtre', 'load-3', 'Massage du visage à Maison Muses Bien-être'],
];

// Photos du marquee (section 3), dans l'ordre d'affichage autour du portrait central
const marquee = [
  ['marquee-1', 'Cliente de Maison Muses, cheveux longs'],
  ['marquee-3', 'Cliente de Maison Muses, couleur cuivrée'],
  ['marquee-4', 'Le salon Maison Muses'],
  ['marquee-5', 'Le salon Maison Muses'],
  ['marquee-6', 'Soin Maison Muses'],
];

// ============ OUTILS ============
const files = fs.readdirSync(IMAGES_DIR);

const findFile = (baseName) => {
  const match = files.find((f) => path.basename(f, path.extname(f)).toLowerCase() === baseName.toLowerCase());
  return match ? path.join(IMAGES_DIR, match) : null;
};

const uploaded = new Map();

const uploadImage = async (baseName) => {
  if (uploaded.has(baseName)) return uploaded.get(baseName);

  const file = findFile(baseName);
  if (!file) {
    console.warn(`  ! ${baseName} introuvable dans public/images, champ ignoré`);
    return null;
  }

  const sizeMb = fs.statSync(file).size / 1024 / 1024;
  if (sizeMb > MAX_MB) {
    console.warn(`  ! ${path.basename(file)} fait ${sizeMb.toFixed(1)} Mo : compresse-la avant (ignorée)`);
    return null;
  }

  const asset = await client.assets.upload('image', fs.createReadStream(file), { filename: path.basename(file) });
  console.log(`  ✓ ${path.basename(file)} envoyée (${sizeMb.toFixed(1)} Mo)`);
  uploaded.set(baseName, asset._id);
  return asset._id;
};

const imageField = (assetId, alt) => ({
  _type: 'cmsImage',
  asset: { _type: 'reference', _ref: assetId },
  alt,
});

// ============ IMPORT ============
const run = async () => {
  const home = await client.getDocument('homepage');
  if (!home) {
    console.error('✗ Le document « homepage » n’existe pas : importe d’abord le seed ou publie la page d’accueil.');
    process.exit(1);
  }

  const draft = await client.getDocument('drafts.homepage');
  if (draft) {
    console.warn('! Un brouillon non publié de la page d’accueil existe : publie-le ou annule-le dans le Studio, sinon il masquera les photos.');
  }

  console.log('Envoi des photos…');
  const set = {};

  for (const [field, baseName, alt] of photos) {
    const assetId = await uploadImage(baseName);
    if (assetId) set[`photos.${field}`] = imageField(assetId, alt);
  }

  const marqueeItems = [];
  for (const [i, [baseName, alt]] of marquee.entries()) {
    const assetId = await uploadImage(baseName);
    if (assetId) marqueeItems.push({ _key: `marquee${i + 1}`, ...imageField(assetId, alt) });
  }
  if (marqueeItems.length) set['photos.s3.marquee'] = marqueeItems;

  await client
    .patch('homepage')
    .setIfMissing({ photos: {} })
    .setIfMissing({ 'photos.loader': {}, 'photos.hero': {}, 'photos.s2': {}, 'photos.s3': {}, 'photos.s4': {}, 'photos.coffrets': {}, 'photos.routines': {} })
    .set(set)
    .commit();

  console.log(`\n✓ ${Object.keys(set).length} champs remplis dans « Photos du site ». La page d’accueil est publiée.`);
};

run().catch((err) => {
  console.error('✗ Erreur :', err.message);
  process.exit(1);
});
