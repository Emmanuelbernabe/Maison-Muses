import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Pages marques : hero en masque, apparitions, pop-up produit ; ne fait rien ailleurs
export function initMarque() {
  const hero = document.querySelector<HTMLElement>('[data-anim="br-hero"]');
  if (!hero) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initMarqueHero(hero, reduce);
  initMarqueReveals(reduce);
  initMarqueModal(reduce);
}

// ============ HERO : UNE IMAGE, DEUX FENÊTRES ============
function initMarqueHero(hero: HTMLElement, reduce: boolean) {
  const mask = hero.querySelector<HTMLElement>('[data-br-mask]');
  const wins = [...hero.querySelectorAll<HTMLElement>('[data-br-win]')];
  const winLeft = wins[0];
  const winGrow = hero.querySelector<HTMLElement>('[data-br-grow]');
  if (!mask || !winLeft || !winGrow) return;
  const imgs = wins.map((win) => win.querySelector<HTMLElement>('img')!);

  // L'image couvre toute la zone (du bord gauche de la 1re fenêtre à la marge de droite,
  // hauteur de la 1re fenêtre) ; chaque fenêtre en montre sa partie, au bon décalage
  const marqueMaskPlace = () => {
    const boxW = mask.clientWidth;
    const boxH = winLeft.offsetHeight;
    imgs.forEach((img) => {
      img.style.width = `${boxW}px`;
      img.style.height = `${boxH}px`;
      img.style.left = `${-(img.parentElement!.offsetLeft - winLeft.offsetLeft)}px`;
    });
  };
  marqueMaskPlace();
  ScrollTrigger.addEventListener('refreshInit', marqueMaskPlace);

  // Au scroll : la fenêtre de droite s'élargit jusqu'à la marge et prend la hauteur de celle de gauche
  const marqueMaskGrow = gsap.timeline({
    scrollTrigger: {
      trigger: mask,
      start: 'top 78%',
      end: 'top 12%',
      scrub: reduce ? false : 0.8,
      invalidateOnRefresh: true,
      onRefreshInit: () => gsap.set(winGrow, { clearProps: 'width,height' }),
    },
  });
  marqueMaskGrow.fromTo(
    winGrow,
    { width: () => winGrow.offsetWidth, height: () => winGrow.offsetHeight },
    { width: () => mask.clientWidth - (winGrow.offsetLeft - winLeft.offsetLeft), height: () => winLeft.offsetHeight, ease: 'none' },
  );
  // Léger zoom arrière, identique dans les deux fenêtres : le masque reste parfait
  if (!reduce) marqueMaskGrow.fromTo(imgs, { yPercent: -4, scale: 1.08 }, { yPercent: 0, scale: 1, ease: 'none' }, 0);

  // Arrivée : le titre monte ligne par ligne, puis le texte et les fenêtres
  if (!reduce) {
    gsap.from(hero.querySelectorAll('[data-br-line]'), { yPercent: 105, duration: 1.3, ease: 'musesEase', stagger: 0.12, delay: 0.15 });
    gsap.from(hero.querySelectorAll('[data-br-fade]'), { y: 24, autoAlpha: 0, duration: 1.1, ease: 'musesEase', delay: 0.55 });
    gsap.from(wins, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'musesEase', stagger: 0.12, delay: 0.4 });
  }
}

// ============ APPARITIONS AU SCROLL ============
function initMarqueReveals(reduce: boolean) {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('main [data-br-fade]').forEach((el) => {
    if (el.closest('[data-anim="br-hero"]')) return;
    gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: 'musesEase', scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } });
  });
  document.querySelectorAll<HTMLElement>('[data-br-clip]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'musesEase', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });
}

// ============ POP-UP PRODUIT ============
function initMarqueModal(reduce: boolean) {
  const holder = document.querySelector<HTMLElement>('[data-br-products]');
  const modal = document.querySelector<HTMLElement>('[data-br-modal]');
  const slider = holder?.querySelector<HTMLElement>('[data-anim="cf-slider"]');
  if (!holder || !modal || !slider) return;
  const marqueProducts = JSON.parse(holder.dataset.brProducts || '[]');
  const dlg = modal.querySelector<HTMLElement>('[data-br-dlg]')!;
  const veil = modal.querySelector<HTMLElement>('.br-veil')!;
  const field = (name: string) => modal.querySelector<HTMLElement>(`[data-br-m="${name}"]`)!;
  let marqueLastFocus: HTMLElement | null = null;

  const marqueModalOpen = (index: number, from: HTMLElement) => {
    const product = marqueProducts[index];
    if (!product) return;
    marqueLastFocus = document.activeElement as HTMLElement;
    field('name').textContent = product.name;
    field('subtitle').textContent = product.subtitle;
    field('description').textContent = product.description;
    const img = field('img') as HTMLImageElement;
    img.src = product.src;
    img.alt = product.alt;
    const specs = field('specs');
    specs.replaceChildren(...product.specs.map(([label, value]: string[]) => {
      const row = document.createElement('div');
      row.className = 'br-spec';
      const l = document.createElement('span');
      l.className = 'br-mut';
      l.textContent = label;
      const v = document.createElement('span');
      v.textContent = value;
      row.append(l, v);
      return row;
    }));

    modal.hidden = false;
    document.documentElement.classList.add('is-modal-open');
    (window as any).__lenis?.stop();
    // La pop-up s'ouvre depuis le produit cliqué
    const r = from.getBoundingClientRect();
    gsap.set(dlg, { transformOrigin: `${r.left + r.width / 2}px ${r.top + r.height / 2}px` });
    const body = dlg.querySelectorAll('.br-dlg-body > *');
    if (reduce) {
      gsap.set([veil, dlg, body], { clearProps: 'all' });
    } else {
      gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'musesEase' });
      gsap.fromTo(dlg, { clipPath: 'inset(46% 46% 46% 46% round 4px)', scale: 0.92, y: 24, autoAlpha: 0 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, y: 0, autoAlpha: 1, duration: 0.9, ease: 'musesEase' });
      gsap.fromTo(body, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'musesEase', stagger: 0.07, delay: 0.35 });
    }
    setTimeout(() => modal.querySelector<HTMLElement>('.br-close')?.focus(), 50);
  };

  const marqueModalClose = () => {
    if (modal.hidden) return;
    const done = () => {
      modal.hidden = true;
      document.documentElement.classList.remove('is-modal-open');
      (window as any).__lenis?.start();
      marqueLastFocus?.focus();
    };
    if (reduce) return done();
    gsap.to(veil, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' });
    gsap.to(dlg, { autoAlpha: 0, scale: 0.96, y: 16, duration: 0.45, ease: 'power2.out', onComplete: done });
  };

  slider.addEventListener('cf-slide-click', (e) => {
    const { index, slide } = (e as CustomEvent).detail;
    marqueModalOpen(index, slide);
  });
  modal.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-br-close]')) marqueModalClose();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') marqueModalClose();
  });
  // Changement de page avec la pop-up ouverte : on remet le scroll en route
  document.addEventListener('astro:before-swap', () => { if (!modal.hidden) { (window as any).__lenis?.start(); document.documentElement.classList.remove('is-modal-open'); } }, { once: true });
}
