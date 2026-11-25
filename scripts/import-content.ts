// ============ IMPORT DU CONTENU DU SITE DANS SANITY ============
// Remplit Sanity avec le contenu de référence du site (src/lib/content-defaults.ts) :
// accueil, réglages (header, menu, footer), coffrets, page L'équipe, textes des pages journal.
// - Images : celles déjà présentes dans Sanity sont conservées ; sinon le fichier local (public/images) est envoyé.
// - Vidéos : les fichiers locaux (public/video) sont envoyés (Sanity ne garde qu'un exemplaire de chaque fichier).
// - Titre et description Google déjà saisis dans Sanity : conservés.
// - Anciens documents inutilisés (membres, conseils d'experts, épisodes) : supprimés.
// Pensez à sauvegarder avant (npx sanity documents query … > sauvegarde.json, dans studio/).
//
// Lancement, depuis la racine du projet (Node 24+) :
//   node --env-file=.env scripts/import-content.ts            → simulation : affiche ce qui serait écrit
//   node --env-file=.env scripts/import-content.ts --write    → écrit dans Sanity
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';
import { HOME, SETTINGS, EQUIPE, JOURNAL } from '../src/lib/content-defaults.ts';

const WRITE = process.argv.includes('--write');
const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_WRITE_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
  console.error('✗ SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN manquant dans le .env');
  process.exit(1);
}
const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, apiVersion: '2025-01-01', token: SANITY_WRITE_TOKEN, useCdn: false });

/* ───────── Fichiers locaux ───────── */
const findLocal = (dir: string, names: string[]) => {
  const files = fs.readdirSync(dir);
  for (const n of names) {
    const f = files.find((x) => x.toLowerCase().replace(/\.[^.]+$/, '') === n.toLowerCase());
    if (f) return path.join(dir, f);
  }
  return null;
};

const uploaded = new Map<string, string>();
async function upload(kind: 'image' | 'file', file: string) {
  if (uploaded.has(file)) return uploaded.get(file)!;
  let id = `(simulation) ${path.basename(file)}`;
  if (WRITE) {
    const asset = await client.assets.upload(kind, fs.createReadStream(file), { filename: path.basename(file) });
    id = asset._id;
  }
  console.log(`  ↑ ${kind === 'image' ? 'image' : 'vidéo'} ${path.basename(file)} (${(fs.statSync(file).size / 1e6).toFixed(1)} Mo)`);
  uploaded.set(file, id);
  return id;
}

// Nom du champ liste → type de ses éléments (noms définis dans studio/schemaTypes)
const ITEM_TYPES: Record<string, string> = {
  menu: 'menuItem', items: 'review', doors: 'door', places: 'place', services: 'service', members: 'teamMember',
};

/* ───────── Conversion du contenu de référence en document Sanity ─────────
   existing : valeur actuelle dans Sanity au même endroit (images à conserver) */
async function toSanity(def: any, existing?: any): Promise<any> {
  if (def === null || def === undefined) return undefined;
  if (typeof def === 'object' && '__img' in def) {
    if (existing?.asset?._ref) return { _type: 'cmsImage', ...existing, alt: existing.alt || def.alt || undefined };
    const file = findLocal('public/images', def.__img);
    if (!file) return undefined;
    return { _type: 'cmsImage', asset: { _type: 'reference', _ref: await upload('image', file) }, ...(def.alt ? { alt: def.alt } : {}) };
  }
  if (typeof def === 'object' && '__vid' in def) {
    if (existing?.asset?._ref) return existing;
    const file = findLocal('public/video', def.__vid);
    if (!file) return undefined;
    return { _type: 'file', asset: { _type: 'reference', _ref: await upload('file', file) } };
  }
  if (Array.isArray(def)) {
    const out = [];
    for (let i = 0; i < def.length; i++) {
      const v = await toSanity(def[i], existing?.[i]);
      if (v === undefined) continue;
      out.push(typeof v === 'object' ? { _key: randomUUID().slice(0, 12), ...v } : v);
    }
    return out;
  }
  if (typeof def === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(def)) {
      let x = await toSanity(v, existing?.[k]);
      // Éléments de liste : type déclaré dans le schéma (studio/schemaTypes)
      if (Array.isArray(x) && ITEM_TYPES[k]) x = x.map((it: any) => (it && typeof it === 'object' && !it._type ? { _type: ITEM_TYPES[k], ...it } : it));
      if (x !== undefined && !(Array.isArray(x) && x.length === 0)) out[k] = x;
    }
    // Lien : type Sanity « link »
    if ('label' in def && 'url' in def && Object.keys(def).length === 2) out._type = 'link';
    return out;
  }
  return def;
}

/* ───────── Images déjà dans Sanity (anciens emplacements « photos ») ───────── */
const old = await client.fetch(`{
  "home": *[_id == "homepage"][0]{ seoTitle, seoDescription, photos, loader, hero, intro, gallery, team, coffrets },
  "settings": *[_id == "siteSettings"][0]{ logo },
  "drafts": *[_id in path("drafts.**") && _type in ["homepage", "siteSettings", "coffret", "equipePage", "journalPage"]]._id,
  "obsolete": *[_type in ["member", "article", "episode"]]._id
}`);
const ph = old.home?.photos ?? {};
const cf = ph.coffrets ?? {};
const imgOf = (v: any) => (v?.asset?._ref ? v : undefined);
// Emplacement actuel → nouvel emplacement (le nouveau prime s'il est déjà rempli)
const existingHome = {
  loader: { load1: ph.loader?.load1, load2: ph.loader?.load2, load3: ph.loader?.load3, load4: ph.loader?.load4, ...old.home?.loader },
  hero: { portrait: ph.hero?.portrait, reveal: ph.hero?.reveal, center: ph.hero?.center },
  intro: { image: imgOf(old.home?.intro?.image) ?? ph.intro?.ambiance },
  gallery: { images: old.home?.gallery?.images ?? ph.gallery?.marquee },
  team: { thumb: ph.team?.thumb, left: ph.team?.teamLeft, mid: ph.team?.teamMid, right: ph.team?.teamRight },
  routines: { doors: [{ image: ph.routines?.coiffure }, { image: ph.routines?.bienEtre }] },
};
const existingCoffrets = [
  { bigImage: cf.initiationBig, smallImage: cf.initiationSmall },
  { bigImage: cf.harmonieBig, smallImage: cf.harmonieSmall },
  { bigImage: cf.symbioseBig, smallImage: cf.symbioseSmall },
  { bigImage: undefined, smallImage: cf.prestigeSmall },
];
if (old.drafts.length) console.log(`⚠ Brouillons en cours sur : ${old.drafts.join(', ')} (ils masqueront le contenu importé dans le Studio tant qu'ils existent)`);

/* ───────── Construction des documents ───────── */
console.log(WRITE ? '— Écriture dans Sanity —' : '— Simulation (rien n’est écrit ; ajouter --write) —');
const coffretIds = ['coffret-initiation', 'coffret-harmonie', 'coffret-symbiose', 'coffret-prestige'];
const coffrets = [];
for (let i = 0; i < 4; i++) {
  const { bigVideo, ...rest } = HOME.coffrets.items[i] as any;
  const doc = await toSanity({ ...rest, bigVideo }, existingCoffrets[i]);
  coffrets.push({ _id: coffretIds[i], _type: 'coffret', ...doc });
}

const { coffrets: coffretsDef, seoTitle, seoDescription, ...homeSections } = HOME as any;
const homeDoc = {
  _id: 'homepage',
  _type: 'homepage',
  seoTitle: old.home?.seoTitle || seoTitle,
  ...(old.home?.seoDescription || seoDescription ? { seoDescription: old.home?.seoDescription || seoDescription } : {}),
  ...(await toSanity(homeSections, existingHome)),
  coffrets: {
    ...(await toSanity({ title: coffretsDef.title, text: coffretsDef.text, prefix: coffretsDef.prefix })),
    items: coffretIds.map((id) => ({ _key: id, _type: 'reference', _ref: id })),
  },
};

const settingsDoc = { _id: 'siteSettings', _type: 'siteSettings', ...(await toSanity(SETTINGS, { logo: imgOf(old.settings?.logo) })) };
const equipeDoc = { _id: 'page-equipe', _type: 'equipePage', ...(await toSanity(EQUIPE)) };
const journalDoc = { _id: 'page-journal', _type: 'journalPage', ...(await toSanity(JOURNAL)) };

/* ───────── Écriture ───────── */
const docs = [homeDoc, settingsDoc, equipeDoc, journalDoc, ...coffrets];
for (const d of docs) console.log(`  ✎ ${d._id} (${d._type}) : ${Object.keys(d).filter((k) => !k.startsWith('_')).join(', ')}`);
for (const id of old.obsolete) console.log(`  ✗ suppression ${id}`);

if (!WRITE) {
  fs.writeFileSync('import-preview.json', JSON.stringify(docs, null, 2));
  console.log('Aperçu complet écrit dans import-preview.json');
  process.exit(0);
}
const tx = client.transaction();
for (const d of docs) tx.createOrReplace(d);
for (const id of old.obsolete) tx.delete(id);
await tx.commit({ visibility: 'sync' });
console.log(`✓ ${docs.length} documents écrits, ${old.obsolete.length} supprimés`);
