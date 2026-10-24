import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

let lenis: Lenis | null = null;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;
const EXPO = 'expo.out';
/** Durée nulle si l'utilisateur préfère réduire les animations */
const t = (d: number) => (reduce ? 0 : d);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ───────── Lenis : défilement fluide, synchronisé avec GSAP / ScrollTrigger ───────── */
function initLenis() {
  if (reduce) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
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
}

/* ───────── Hero : montée du titre + parallaxe de l'image ───────── */
function initHero() {
  if (reduce) return;
  const span = document.querySelector('.hero h1 span');
  if (!span) return;
  gsap
    .timeline({ defaults: { ease: EXPO } })
    .fromTo(span, { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 1.3 }, 0.15)
    .fromTo('[data-hero]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.5);

  // Parallaxe interne : le cadre .img reste fixe, seule l'image (130 % de haut) glisse à l'intérieur
  gsap.fromTo(
    '.hero .img img',
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    },
  );
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
        return gsap.from(self.lines, {
          yPercent: 120,
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

initLenis();
initHeader();
initHero();
initSplit();
initReveals();
initAccordion();
initMarquee();
initHovers();
initAnchors();
addEventListener('load', () => ScrollTrigger.refresh());
