import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initLoader } from './home/loader';
import { initHomeHero } from './home/hero';
import { initHomeIntro } from './home/intro';
import { initHomeGallery } from './home/gallery';
import { initHomeTeam } from './home/team';
import { initHomeCoffrets } from './home/coffrets';
import { initHomeReviews } from './home/reviews';
import { initHomeRoutines } from './home/routines';
import { initHomeJournal } from './home/journal';
import { initFooter } from './layout/footer';
import { initEquipe } from './pages/equipe';
import { initServicePage } from './pages/service';
import { initJournal } from './pages/journal';
import { initMenu } from './layout/menu';
import { initBrandPage } from './pages/brand';


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

// Pas de recalcul quand la barre d'adresse mobile apparaît / disparaît
ScrollTrigger.config({ ignoreMobileResize: true });

// La position de scroll est restaurée par nous, une fois les pins en place (sinon le navigateur la pose trop tôt)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const SCROLL_KEY = `mm-scroll:${location.pathname}`;
addEventListener('pagehide', () => {
  try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY))); } catch {}
});

function restoreScroll() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const isReturn = nav && (nav.type === 'reload' || nav.type === 'back_forward');
  let y = 0;
  try { y = isReturn ? Number(sessionStorage.getItem(SCROLL_KEY)) || 0 : 0; } catch {}
  // Une ancre dans l'URL (ex. /#coffrets depuis la page équipe) garde la priorité :
  // on y va une fois les pins en place, sinon la position serait fausse
  if (location.hash) {
    const target = document.querySelector<HTMLElement>(location.hash);
    if (target) {
      const ty = location.hash === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 72;
      if (lenis) lenis.scrollTo(ty, { immediate: true, force: true });
      else window.scrollTo(0, ty);
      ScrollTrigger.update();
    }
    return;
  }
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
  ScrollTrigger.update();
}

let lenis: Lenis | null = null;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Durée nulle si l'utilisateur préfère réduire les animations */
const t = (d: number) => (reduce ? 0 : d);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ───────── Lenis : défilement fluide, synchronisé avec GSAP / ScrollTrigger ───────── */
// Lenis seulement avec une souris / un trackpad : sur tactile, le scroll natif est plus fiable
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

function initLenis() {
  if (reduce || !finePointer) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  (window as any).__lenis = lenis;   // utilisé par home/coffrets.ts pour le passage carte par carte
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Lenis remesure la page avant chaque recalcul des ScrollTrigger
  ScrollTrigger.addEventListener('refreshInit', () => lenis?.resize());
}

/* ───────── Blocage du scroll (loader, menu) : Lenis si présent, sinon scroll natif ───────── */
function lockScroll(on: boolean) {
  if (lenis) {
    if (on) lenis.stop();
    else lenis.start();
    return;
  }
  document.documentElement.style.overflow = on ? 'hidden' : '';
}

/* ───────── Resize global : un seul recalcul de tous les ScrollTrigger, une fois le resize terminé ───────── */
function initResize() {
  let resizeTimer = 0;
  let lastW = innerWidth;
  let lastH = innerHeight;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Sur tactile, seule la largeur compte : la barre d'adresse qui apparaît / disparaît change
      // la hauteur en plein scroll, et un recalcul à ce moment-là coupait l'élan du scroll
      const heightOnly = innerWidth === lastW;
      if (heightOnly && (innerHeight === lastH || !finePointer)) return;
      lastW = innerWidth;
      lastH = innerHeight;
      ScrollTrigger.refresh();
    }, 250);
  });
}

/* ───────── Header : fond / couleur / flou pilotés par variables CSS ───────── */
function initHeader() {
  const hd = document.getElementById('hd');
  const hero = document.querySelector('.hero');
  if (!hd || !hero) return;
  const solid = (on: boolean) =>
    gsap.to(hd, { '--hb': on ? 86 : 0, '--hc': on ? 100 : 0, '--hblur': on ? 14 : 0, duration: t(0.4), ease: 'power2.out', overwrite: true });
  const st = ScrollTrigger.create({ trigger: hero, start: 'bottom top+=70', end: 'max', onToggle: (s) => solid(s.isActive) });
  if (st.isActive) solid(true);

  // Items du header en crème tant que le milieu du header est au-dessus d'une section orange (coffrets)
  // refreshPriority -1 : calculé après le pin horizontal des coffrets
  const hdMid = () => `top top+=${hd.offsetHeight / 2}`;
  const hdMidEnd = () => `bottom top+=${hd.offsetHeight / 2}`;
  document.querySelectorAll<HTMLElement>('#coffrets').forEach((orangeSection) => {
    ScrollTrigger.create({
      trigger: orangeSection,
      start: hdMid,
      end: hdMidEnd,
      refreshPriority: -1,
      invalidateOnRefresh: true,
      toggleClass: { targets: hd, className: 'is-on-orange' },
    });
  });
}

// Une seule fois pour tout le site (ils survivent aux changements de page)
initLenis();
initResize();

/* ───────── Ancres : défilement fluide ───────── */
function initAnchors() {
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      const offset = id === '#top' ? 0 : -72;
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset, duration: 1.4, easing: (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)) });
      else window.scrollTo({ top: (target as HTMLElement).getBoundingClientRect().top + scrollY + offset });
      history.pushState(null, '', id);
    }),
  );

  // Liens vers l'accueil (logo, « Accueil ») quand on y est déjà : retour en haut en douceur,
  // sans recharger la page ni ajouter d'ancre dans l'adresse
  if (location.pathname !== '/') return;
  $$<HTMLAnchorElement>('a[href="/"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.4, easing: (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)) });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) history.replaceState(history.state, '', '/');
    }),
  );
}

/* ───────── Initialisation d'une page ─────────
   Avec les View Transitions d'Astro (ClientRouter), on ne recharge plus la page : ce bloc est rejoué
   à chaque arrivée sur une page, et tout ce qu'il crée est rangé dans un gsap.context
   pour être nettoyé d'un coup avant le changement de page. */
const LOADER_KEY = 'mm-loader-seen';
const loaderWasSeen = () => {
  try { return sessionStorage.getItem(LOADER_KEY) === '1'; } catch { return false; }
};

let pageCtx: gsap.Context | null = null;

function initSections() {
  // En premier : les pins de la page équipe doivent exister avant les déclencheurs du CTA / footer
  initEquipe();
  initServicePage();
  initJournal();
  initBrandPage();
  initHomeHero();
  initHomeIntro();
  initHomeGallery();
  initHomeTeam();
  initHomeCoffrets();
  initHomeReviews();
  initHomeRoutines();
  initHomeJournal();
  initFooter();
  initAnchors();
}

// Arrivée avec une ancre (ex. /#coffrets depuis la page équipe) : on y va une fois les pins en place
function scrollToHash(smooth: boolean) {
  const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : null;
  if (!target || location.hash === '#top') return;
  if (lenis) lenis.scrollTo(target, { offset: -72, immediate: !smooth, force: true, duration: 1.4 });
  else target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
}

function startPage(isFirstLoad: boolean) {
  // Une seule initialisation par page (le body est remplacé à chaque navigation)
  if (document.body.dataset.mmInit) return;
  document.body.dataset.mmInit = '1';

  const loaderEl = document.getElementById('loader');
  // Le loader ne se joue qu'au premier chargement réel de la home, une fois par visite
  const playLoader = isFirstLoad && !reduce && !!loaderEl && !loaderWasSeen();

  pageCtx = gsap.context(() => {
    initHeader();
    initMenu((open) => lockScroll(open));

    if (playLoader) {
      // Le loader fait office d'entrée : pas de transition de rechargement en plus
      document.documentElement.classList.remove('mm-reload');
      // Pas de scroll possible tant que le loader tourne, et départ en haut de page
      window.scrollTo(0, 0);
      lockScroll(true);
      initLoader().then(async () => {
        try { sessionStorage.setItem(LOADER_KEY, '1'); } catch {}
        lockScroll(false);
        await document.fonts.ready;
        pageCtx?.add(() => {
          initSections();
          ScrollTrigger.refresh();
          scrollToHash(true);
        });
      });
      return;
    }

    loaderEl?.classList.add('ld-done');
    const hd = document.getElementById('hd');
    if (hd) {
      gsap.set(hd, { y: 0, opacity: 1 });
      hd.classList.add('hd-ready');
    }
    document.fonts.ready.then(() => {
      pageCtx?.add(() => {
        initSections();
        ScrollTrigger.refresh();
        // Premier chargement : position restaurée (rechargement / retour) ;
        // navigation interne : Astro gère le haut de page, on ne s'occupe que des ancres
        if (isFirstLoad) restoreScroll();
        else scrollToHash(false);
        // La page n'apparaît qu'une fois tout en place (voir LoadingScreen.astro)
        const html = document.documentElement;
        const reveal = () => html.classList.add('mm-ready');
        requestAnimationFrame(() => {
          // Rechargement : entrée avec la même transition qu'entre deux pages (classes page-exit / page-enter de global.css)
          if (isFirstLoad && html.classList.contains('mm-reload') && !html.classList.contains('mm-ready') && document.startViewTransition) {
            document.startViewTransition(reveal);
          } else {
            reveal();
          }
        });
      });
    });
  });
}

/* ───────── Changements de page (View Transitions) ───────── */
// Clic sur un lien du menu : on masque le panneau avant la capture de l'ancienne page,
// sinon il resterait affiché par-dessus toute la transition
document.addEventListener('astro:before-preparation', () => {
  document.querySelectorAll<HTMLElement>('[data-menu-panel], .menu-panel, .menu-backdrop').forEach((el) => {
    el.style.visibility = 'hidden';
  });
});

document.addEventListener('astro:before-swap', (e) => {
  // L'ancienne page vient d'être capturée pour l'animation : on peut tout nettoyer
  lockScroll(false);
  pageCtx?.revert();
  pageCtx = null;
  ScrollTrigger.getAll().forEach((st) => st.kill());

  // Astro remplace les attributs de <html> : on garde nos classes d'état (js, lenis, mm-ready…)
  const nextHtml = (e as any).newDocument.documentElement as HTMLElement;
  nextHtml.classList.add(...document.documentElement.classList, 'mm-ready');
  // Pas de loader sur une navigation interne : il resterait affiché pendant la transition
  if ((e as any).newDocument.getElementById('loader')) {
    nextHtml.classList.add('ld-skip');
    try { sessionStorage.setItem(LOADER_KEY, '1'); } catch {}
  }
});

document.addEventListener('astro:after-swap', () => {
  // Astro a remis la page en haut (ou à la position d'un retour arrière) : Lenis se resynchronise
  if (lenis) {
    // Un défilement encore en cours sur l'ancienne page (molette, trackpad, ancre) doit s'arrêter net :
    // sinon Lenis le termine sur la nouvelle page et l'emmène vers le bas (footer, même section).
    // stop() + start() coupent l'animation et recalent Lenis sur la position réelle (le haut de page).
    lenis.stop();
    lenis.start();
    lenis.resize();
  }
});

// Ancienne adresse en /#top (favori, historique) : on retire l'ancre, inutile (la page s'ouvre déjà en haut)
if (location.hash === '#top') history.replaceState(history.state, '', location.pathname + location.search);

// Premier chargement, puis chaque navigation
startPage(true);
document.addEventListener('astro:page-load', () => startPage(false));
addEventListener('load', () => ScrollTrigger.refresh());
