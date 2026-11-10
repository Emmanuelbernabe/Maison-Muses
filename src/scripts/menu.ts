import { gsap } from 'gsap';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXPO = 'expo.out';

export function initMenu(onToggle?: (open: boolean) => void) {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  const backdrop = document.querySelector<HTMLElement>('[data-menu-backdrop]');
  const closers = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-close]')) : [];
const title = closers[0];            // le titre « Menu » sert toujours de repère de placement
  const links = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-link]')) : [];
  if (!btn || !panel || !backdrop || !title) return;

  // Place le panneau pour que son titre « Menu » tombe pile sur le bouton MENU du header
  const place = () => {
    const b = btn.getBoundingClientRect();
    panel.style.left = `${Math.round(b.left - title.offsetLeft)}px`;
    panel.style.top = `${Math.round(b.top + b.height / 2 - (title.offsetTop + title.offsetHeight / 2))}px`;
  };

  // Une seule timeline : le panneau s'ouvre en clip-path, les liens entrent en stagger EN MÊME TEMPS
  const tl = gsap.timeline({ paused: true })
    .set([panel, backdrop], { visibility: 'visible', immediateRender: false }, 0)
    .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
    .fromTo(panel, { clipPath: 'inset(0% 100% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: EXPO }, 0)
    .fromTo(links, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: EXPO, stagger: 0.07 }, 0.1);

  let open = false;
  const setOpen = (next: boolean) => {
    if (next === open) return;
    open = next;
    if (next) place();
    btn.setAttribute('aria-expanded', String(next));
    panel.toggleAttribute('inert', !next);
    document.documentElement.classList.toggle('menu-open', next);
    onToggle?.(next);

    if (reduce) tl.progress(next ? 1 : 0);
    else if (next) tl.timeScale(1).play();
    else tl.timeScale(1.6).reverse();          // fermeture un peu plus rapide

    (next ? title : btn).focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => setOpen(true));
  closers.forEach((el) => el.addEventListener('click', () => setOpen(false)));
  backdrop.addEventListener('click', () => setOpen(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  // Phase de capture : le menu se ferme (et Lenis redémarre) AVANT que initAnchors ne lance le scroll
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  }, true);
  addEventListener('resize', () => { if (open) place(); });
}