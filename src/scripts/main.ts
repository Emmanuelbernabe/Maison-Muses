import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initLoader } from './loader';
import { initSection2 } from './section2';
import { initSection3 } from './section3';
import { initSection4 } from './section4';
import { initSection5 } from './section5';
import { initSection6 } from './section6';
import { initSection7 } from './section7';
import { initSection8 } from './section8';
import { initSection9 } from './section9';
import { initEquipe } from './equipe';
import { initCoiffure } from './coiffure';
import { initJournal } from './journal';
import { initMenu } from './menu';
import { initMarque } from './marque';


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
  // Une ancre dans l'URL (ex. /#s5 depuis la page équipe) garde la priorité :
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
const canHover = matchMedia('(hover: hover)').matches;
const EXPO = 'expo.out';
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
  (window as any).__lenis = lenis;   // utilisé par section5.ts pour le passage carte par carte
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
  // refreshPriority -1 : calculé après le pin horizontal de la section 5
  const hdMid = () => `top top+=${hd.offsetHeight / 2}`;
  const hdMidEnd = () => `bottom top+=${hd.offsetHeight / 2}`;
  document.querySelectorAll<HTMLElement>('#s5').forEach((orangeSection) => {
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

/* ───────── Hero : parallaxe supprimée (remplacée par l'animation section2 pinnée) ───────── */
function initHero() {
  // La parallaxe de l'image est désormais gérée par la timeline pinnée de section2.ts
  // On ne crée pas de ScrollTrigger concurrent sur .hero
}

/* ───────── Titres .big : révélation ligne par ligne (SplitText) ───────── */
function initSplit() {
  if (reduce) return;
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true, // re-découpe si la police charge ou si la largeur change
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        // le masque (overflow: clip) ne doit pas rogner les jambages
        self.masks.forEach((m: HTMLElement) => gsap.set(m, { paddingBottom: '0.12em', marginBottom: '-0.12em' }));
        // Départ posé explicitement : un gsap.from() ne l'applique pas toujours quand la page se recharge déjà défilée
        gsap.set(self.lines, { yPercent: 120 });
        return gsap.to(self.lines, {
          yPercent: 0,
          duration: 1.2,
          ease: EXPO,
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

/* ───────── Apparitions au scroll ───────── */
function initReveals() {
  if (reduce) return;
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: EXPO, stagger: 0.1, overwrite: true }),
  });
  if (document.querySelector('.mos')) {
    gsap.fromTo(
      '.mos > div',
      { y: 90, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: EXPO, stagger: 0.1, scrollTrigger: { trigger: '.mos', start: 'top 88%', once: true } },
    );
  }
}

/* ───────── Accordéon des coffrets ───────── */
function initAccordion() {
  const rows = $$('[data-row]');
  if (!rows.length) return;

  const parts = (row: HTMLElement) => ({
    btn: row.querySelector('button')!,
    detail: row.querySelector<HTMLElement>('.detail'),
    ph: row.querySelector<HTMLElement>('.ph'),
    kids: $$('[data-d]', row),
  });

  const reveal = (row: HTMLElement, delay = 0.1) => {
    const { ph, kids } = parts(row);
    if (ph) {
      gsap.fromTo(ph, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: t(1.1), delay: reduce ? 0 : delay, ease: EXPO });
    }
    gsap.fromTo(kids, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: t(0.9), delay: reduce ? 0 : delay + 0.1, stagger: reduce ? 0 : 0.07, ease: EXPO });
  };

  const setOpen = (row: HTMLElement, open: boolean) => {
    const { btn, detail, ph, kids } = parts(row);
    if (!detail) return;
    gsap.killTweensOf([detail, ph, ...kids]);
    row.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    detail.toggleAttribute('inert', !open);
    gsap.to(detail, {
      height: open ? 'auto' : 0,
      duration: t(open ? 0.7 : 0.5),
      ease: open ? EXPO : 'expo.inOut',
      onComplete: () => ScrollTrigger.refresh(),
    });
    if (open) reveal(row);
  };

  rows.forEach((row) => {
    const btn = row.querySelector('button');
    if (!btn || btn.disabled) return;
    btn.addEventListener('click', () => {
      const wasOpen = row.classList.contains('open');
      rows.forEach((r) => r.classList.contains('open') && setOpen(r, false));
      if (!wasOpen) setOpen(row, true);
    });
  });

  // Ligne ouverte par défaut : on joue son entrée quand la liste arrive à l'écran
  const first = rows.find((r) => r.classList.contains('open'));
  if (first && !reduce) {
    ScrollTrigger.create({ trigger: '.coffrets', start: 'top 75%', once: true, onEnter: () => reveal(first, 0.2) });
  }
}

/* ───────── Survols ───────── */
function hover(trigger: HTMLElement, target: Element, over: gsap.TweenVars, out: gsap.TweenVars) {
  const go = (vars: gsap.TweenVars) => () => gsap.to(target, { ...vars, duration: t(0.5), ease: EXPO, overwrite: 'auto' });
  if (canHover) {
    trigger.addEventListener('pointerenter', go(over));
    trigger.addEventListener('pointerleave', go(out));
  }
  trigger.addEventListener('focusin', () => trigger.querySelector(':focus-visible') || trigger.matches(':focus-visible') ? go(over)() : undefined);
  trigger.addEventListener('focusout', go(out));
}

function initHovers() {
  $$('.lien').forEach((el) => hover(el, el, { gap: 18 }, { gap: 10 }));
  $$('.cols a').forEach((el) => hover(el, el, { paddingLeft: 14 }, { paddingLeft: 0 }));
  $$('.equipe figure').forEach((fig) => {
    const ph = fig.querySelector('.ph2');
    if (ph) hover(fig, ph, { borderRadius: '200px 200px 14px 14px' }, { borderRadius: '999px 999px 14px 14px' });
  });
}

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

/* ───────── Marquee empilé (cartes qui défilent en boucle, ralenties au survol) ───────── */
function initMarquee() {
  const stage = document.querySelector<HTMLElement>('[data-marquee]');
  if (!stage) return;
  const cards = $$('.mq-card', stage);
  const N = cards.length;
  if (!N) return;

  const cfg = { speed: 0.5, gap: 100, rotate: 5, blur: 2, scale: 0.05, anchor: 0.3, ahead: 9, behind: 1.2 };
  const setters = cards.map((el) => ({
    x: gsap.quickSetter(el, 'x', 'px'),
    r: gsap.quickSetter(el, 'rotation', 'deg'),
    s: gsap.quickSetter(el, 'scale'),
    o: gsap.quickSetter(el, 'opacity'),
  }));

  let width = stage.clientWidth;
  let pos = 0;
  const state = { v: 1 };
  let tween: gsap.core.Tween | undefined;

  const offset = (i: number) => {
    let d = (((i - pos) % N) + N) % N;
    if (d > N - cfg.behind) d -= N;
    return d;
  };

  const render = () => {
    const baseX = width * cfg.anchor;
    for (let i = 0; i < N; i++) {
      const el = cards[i];
      const d = offset(i);
      const a = Math.abs(d);
      if (d > cfg.ahead || d < -cfg.behind) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      let op = 1;
      if (d < 0) op = 1 + d / cfg.behind;
      else if (d > cfg.ahead * 0.6) op = 1 - (d - cfg.ahead * 0.6) / (cfg.ahead * 0.4);
      setters[i].x(baseX + d * cfg.gap);
      setters[i].r(-d * cfg.rotate);
      setters[i].s(Math.max(0.1, 1 - cfg.scale * a));
      setters[i].o(Math.max(0, op));
      el.style.zIndex = String(Math.round(1000 - a * 10));
      el.style.filter = `blur(${(cfg.blur * a).toFixed(2)}px) brightness(${Math.max(0.2, 1 - 0.1 * a).toFixed(2)})`;
    }
  };

  const tick = (_time: number, dt: number) => {
    pos += (cfg.speed * state.v * Math.min(dt, 100)) / 1000;
    if (pos > N) pos -= N;
    else if (pos < -N) pos += N;
    render();
  };

  new ResizeObserver(() => {
    width = stage.clientWidth;
    render();
  }).observe(stage);
  render();

  if (reduce) return; // image fixe si l'utilisateur préfère réduire les animations

  new IntersectionObserver((e) => {
    if (e[0].isIntersecting) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  }).observe(stage);

  if (canHover) {
    stage.addEventListener('pointerenter', () => {
      tween?.kill();
      tween = gsap.to(state, { v: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    stage.addEventListener('pointerleave', () => {
      tween?.kill();
      tween = gsap.to(state, { v: 1, duration: 0.8, ease: 'power2.out' });
    });
  }
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
  initCoiffure();
  initJournal();
  initMarque();
  initSection2();
  initSection3();
  initSection4();
  initSection5();
  initSection6();
  initSection7();
  initSection8();
  initSection9();
  initSplit();
  initReveals();
  initAccordion();
  initMarquee();
  initHovers();
  initAnchors();
}

// Arrivée avec une ancre (ex. /#s5 depuis la page équipe) : on y va une fois les pins en place
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
    initHero();

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
