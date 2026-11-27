/* ───────── Consentement aux cookies (bandeau : components/layout/CookieBanner.astro) ─────────
   Conforme aux recommandations de la CNIL :
   - rien n'est déposé ni chargé avant le choix (Google Tag Manager / Analytics) ;
   - « Tout accepter », « Tout refuser » et « Personnaliser » ont le même poids visuel ;
   - le choix est gardé 6 mois, puis redemandé ; le lien « Cookies » du pied de page (#cookies) rouvre les réglages ;
   - retirer son accord efface les cookies Google Analytics.
   Le choix est aussi reflété sur <html> (classe cc-analytics) et diffusé par l'événement « mm:consent ».
   (Les cartes du pied de page sont des images fixes : aucun cookie, pas de consentement nécessaire.) */

export type Consent = { analytics: boolean; ts: number };

const KEY = 'mm-consent';
const MAX_AGE = 1000 * 60 * 60 * 24 * 182;   // 6 mois

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!c || typeof c.ts !== 'number' || Date.now() - c.ts > MAX_AGE) return null;
    return { analytics: !!c.analytics, ts: c.ts };
  } catch {
    return null;
  }
}

const w = window as any;

// Google Tag Manager : chargé une seule fois, et seulement après accord pour la mesure d'audience
function loadGtm() {
  const id = w.__mmGtmId;
  if (!id || w.__mmGtmLoaded) return;
  w.__mmGtmLoaded = true;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

// Accord retiré : suppression des cookies Google Analytics (_ga, _ga_XXXX, _gid) sur le domaine et ses parents
function clearAnalyticsCookies() {
  const names = document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => /^(_ga|_gid|_gat)/.test(n));
  const parts = location.hostname.split('.');
  const domains = parts.map((_, i) => parts.slice(i).join('.')).filter((d) => d.includes('.'));
  names.forEach((n) => {
    document.cookie = `${n}=; Max-Age=0; path=/`;
    domains.forEach((d) => { document.cookie = `${n}=; Max-Age=0; path=/; domain=.${d}`; });
  });
}

export function applyConsent(c: Consent | null) {
  const html = document.documentElement;
  html.classList.toggle('cc-analytics', !!c?.analytics);
  if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: c?.analytics ? 'granted' : 'denied' });
  if (c?.analytics) loadGtm();
}

export function saveConsent(analytics: boolean) {
  const before = readConsent();
  const c: Consent = { analytics, ts: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  if (before?.analytics && !analytics) clearAnalyticsCookies();
  applyConsent(c);
  window.dispatchEvent(new CustomEvent('mm:consent', { detail: c }));
}

/* ───────── Bandeau : affiché sans choix enregistré, rouvert par les liens #cookies ───────── */
let linksBound = false;

export function initConsentBanner() {
  const banner = document.querySelector<HTMLElement>('[data-cc]');
  if (!banner) return;
  const panel = banner.querySelector<HTMLElement>('[data-cc-panel]');
  const boxAnalytics = banner.querySelector<HTMLInputElement>('[data-cc-analytics]');
  const customize = banner.querySelector<HTMLButtonElement>('[data-cc-customize]');

  const close = () => banner.classList.remove('is-open');
  const open = (withPanel = false) => {
    const c = readConsent();
    if (boxAnalytics) boxAnalytics.checked = !!c?.analytics;
    panel?.toggleAttribute('hidden', !withPanel);
    customize?.setAttribute('aria-expanded', String(withPanel));
    banner.classList.add('is-open');
  };

  banner.querySelector('[data-cc-accept]')?.addEventListener('click', () => { saveConsent(true); close(); });
  banner.querySelector('[data-cc-refuse]')?.addEventListener('click', () => { saveConsent(false); close(); });
  banner.querySelector('[data-cc-save]')?.addEventListener('click', () => { saveConsent(!!boxAnalytics?.checked); close(); });
  customize?.addEventListener('click', () => {
    const show = panel?.hasAttribute('hidden') ?? false;
    panel?.toggleAttribute('hidden', !show);
    customize.setAttribute('aria-expanded', String(show));
  });

  // Lien « Cookies » (#cookies), où qu'il soit : rouvre les réglages au lieu de naviguer
  if (!linksBound) {
    linksBound = true;
    // Phase de capture : avant le routeur d'Astro, qui sinon suivrait « /#cookies » vers l'accueil
    document.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('a[href$="#cookies"], [data-cc-open]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      w.__mmOpenConsent?.();
    }, true);
  }
  w.__mmOpenConsent = () => open(true);

  if (!readConsent()) {
    // Sur l'accueil, le bandeau attend la fin du loader pour ne pas le recouvrir
    const loader = document.getElementById('loader');
    const show = () => open(false);
    if (!loader || loader.classList.contains('ld-done')) setTimeout(show, 600);
    else {
      const mo = new MutationObserver(() => {
        if (loader.classList.contains('ld-done')) { mo.disconnect(); setTimeout(show, 600); }
      });
      mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
    }
  }
}
