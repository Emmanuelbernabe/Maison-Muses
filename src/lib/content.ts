/* ───────── Contenu du site : fusion Sanity + valeurs par défaut ─────────
   Chaque champ éditable du site existe dans Sanity (même nom, même structure).
   Valeurs par défaut (= contenu de référence) : lib/content-defaults.ts.
   Un champ vidé dans le Studio reprend sa valeur par défaut : le site ne casse jamais. */
import { clean, getSettings, getHome, getEquipePage, getJournalPage } from './sanity';
import { resolveImage, resolveVideo } from './images';
import { siteImage, type SiteImage } from './siteImage';
import { HOME, SETTINGS, EQUIPE, JOURNAL } from './content-defaults';
export { HOME, SETTINGS, EQUIPE, JOURNAL, img, vid, link } from './content-defaults';

const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v);
const filled = (v: any) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && clean(v) !== '');

/* Fusion : la valeur Sanity si elle est renseignée, sinon la valeur par défaut */
export function merge(def: any, data: any): any {
  if (isObj(def) && '__img' in def) return { image: data?.asset ? data : null, local: def.__img, alt: def.alt };
  if (isObj(def) && '__vid' in def) return clean(data) || resolveVideo(...def.__vid);
  if (isObj(def)) {
    const out: any = {};
    for (const k of Object.keys(def)) out[k] = merge(def[k], data?.[k]);
    return out;
  }
  if (Array.isArray(def)) {
    // Donnée absente, vide ou d'une autre forme (ancien contenu) : valeurs par défaut
    if (!Array.isArray(data) || data.length === 0) return def.map((d) => merge(d, undefined));
    // Listes d'objets : chaque élément est complété par l'élément par défaut de même rang (ou le premier)
    return data.map((d: any, i: number) => merge(def[i] ?? def[0], d));
  }
  // Valeur simple attendue (texte, nombre, booléen) : une donnée d'une autre forme est ignorée
  if (def !== null && typeof def !== 'object' && (data === null || typeof data === 'object')) return def;
  return filled(data) ? data : def;
}

/* Image fusionnée → src/srcset (Sanity) ou fichier local */
export const picture = (m: any, sizes?: string, widths?: number[]): SiteImage & { alt: string } => {
  const s = siteImage(m?.image, resolveImage(...(m?.local ?? [])), sizes, widths);
  return { ...s, alt: s.alt ?? m?.alt ?? '' };
};

/* Lien : adresse nettoyée (sans les repères invisibles de l'aperçu) ; ancre « #… » ramenée à l'accueil hors accueil */
export const href = (url: string | undefined, isHome = true) => {
  const u = clean(url) || '#';
  return u.startsWith('#') && !isHome ? `/${u}` : u;
};

/* ══════════════════════ Chargement fusionné (une requête par document et par build) ══════════════════════ */
const once = <T,>(load: () => Promise<T>) => { let p: Promise<T> | null = null; return () => (p ??= load()); };
export const loadSettings = once(async () => merge(SETTINGS, await getSettings()) as typeof SETTINGS & { logo: any });
export const loadHome = once(async () => merge(HOME, await getHome()) as any);
export const loadEquipe = once(async () => merge(EQUIPE, await getEquipePage()) as any);
export const loadJournalPage = once(async () => merge(JOURNAL, await getJournalPage()) as typeof JOURNAL);
