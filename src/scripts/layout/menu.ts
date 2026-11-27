import { gsap } from 'gsap';
import '../shared/revealTitle';   // déclare la courbe « musesReveal » des révélations d'images

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXPO = 'expo.out';
const IMG_HIDDEN = 'inset(0% 0% 100% 0%)';
const IMG_FULL = 'inset(0% 0% 0% 0%)';

export function initMenu(onToggle?: (open: boolean) => void) {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  const backdrop = document.querySelector<HTMLElement>('[data-menu-backdrop]');
  const closers = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-close]')) : [];
  const title = closers[0];            // le titre « Menu » sert toujours de repère de placement
  const links = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-link]')) : [];
  if (!btn || !panel || !backdrop || !title) return;

  // Place le panneau pour que son titre « Menu » tombe pile sur le bouton MENU du header ;
  // ses marges à l'écran (--menu-x / --menu-y) en découlent, le panneau reste centré
  const place = () => {
    panel.style.left = '0px';
    panel.style.top = '0px';
    const b = btn.getBoundingClientRect();
    const t = title.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const x = Math.max(6, Math.round(b.left - (t.left - p.left)));
    const y = Math.max(6, Math.round(b.top + b.height / 2 - (t.top - p.top + t.height / 2)));
    panel.style.setProperty('--menu-x', `${x}px`);
    panel.style.setProperty('--menu-y', `${y}px`);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
  };

  // Une seule timeline : le panneau s'ouvre en clip-path, les éléments entrent en stagger EN MÊME TEMPS
  const tl = gsap.timeline({ paused: true })
    .set([panel, backdrop], { visibility: 'visible', immediateRender: false }, 0)
    .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
    .fromTo(panel, { clipPath: 'inset(0% 100% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: EXPO }, 0)
    .fromTo(links, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: EXPO, stagger: 0.04 }, 0.1);

  // ── Image de droite : celle du lien survolé (ou au focus clavier) passe devant, révélée de haut en bas ──
  const imgs = new Map<string, HTMLImageElement>();
  panel.querySelectorAll<HTMLImageElement>('[data-menu-img]').forEach((img) => imgs.set(img.dataset.menuImg!, img));
  const initialKey = panel.querySelector<HTMLImageElement>('[data-menu-img].is-shown')?.dataset.menuImg ?? null;
  let currentKey = initialKey;
  let z = 1;
  const showImage = (key: string | undefined, instant = false) => {
    const img = key ? imgs.get(key) : undefined;
    if (!img || key === currentKey) return;
    currentKey = key!;
    img.style.zIndex = String(++z);
    gsap.fromTo(img, { clipPath: IMG_HIDDEN }, { clipPath: IMG_FULL, duration: instant || reduce ? 0 : 1.1, ease: 'musesReveal', overwrite: true });
  };
  panel.querySelectorAll<HTMLElement>('[data-menu-key]').forEach((el) => {
    const key = el.dataset.menuKey;
    el.addEventListener('pointerenter', () => showImage(key));
    el.addEventListener('focus', () => showImage(key));
  });
  // Images chargées dès la première ouverture (elles sont en chargement différé tant que le menu est fermé)
  let imgsLoaded = false;
  const loadImages = () => {
    if (imgsLoaded) return;
    imgsLoaded = true;
    imgs.forEach((img) => { img.loading = 'eager'; });
  };

  let open = false;
  const setOpen = (next: boolean) => {
    if (next === open) return;
    open = next;
    if (next) {
      place();
      loadImages();
      // Chaque ouverture repart sur l'image de la page en cours
      if (initialKey && currentKey !== initialKey) {
        currentKey = null;
        showImage(initialKey, true);
      }
    }
    btn.setAttribute('aria-expanded', String(next));
    panel.toggleAttribute('inert', !next);
    document.documentElement.classList.toggle('menu-open', next);
    onToggle?.(next);

    if (reduce) tl.progress(next ? 1 : 0);
    else if (next) tl.timeScale(1).play();
    else tl.timeScale(1.6).reverse();          // fermeture un peu plus rapide

    // Le panneau n'est rendu visible qu'à l'image suivante (timeline) : un focus immédiat était ignoré
    if (next) requestAnimationFrame(() => title.focus({ preventScroll: true }));
    else btn.focus({ preventScroll: true });
  };

  // Menu ouvert : la tabulation reste dans le panneau (de la fin on revient au début, et inversement)
  const focusables = () =>
    Array.from(panel.querySelectorAll<HTMLElement>('a[href], button')).filter((el) => !el.closest('[inert]') && el.offsetParent !== null);
  addEventListener('keydown', (e) => {
    if (!open || e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const inside = panel.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
  });

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
