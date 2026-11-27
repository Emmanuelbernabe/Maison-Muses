import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Pages marques : hero en masque, apparitions, pop-up produit ; ne fait rien ailleurs
export function initBrandPage() {
  const hero = document.querySelector<HTMLElement>('[data-anim="br-hero"]');
  if (!hero) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initMarqueHero(hero, reduce);
  initMarqueReveals(reduce);
  initMarqueModal(reduce);
  initMarqueCursor(reduce);
}

// ============ CURSEUR DU SLIDER PRODUITS ============
// L'étoile des listes du journal suit la souris et s'étire dans le sens du mouvement ;
// l'invite « Cliquez pour en savoir plus » reste à sa droite, centrée sur le curseur
function initMarqueCursor(reduce: boolean) {
  const holder = document.querySelector<HTMLElement>('[data-br-products]');
  const cursor = holder?.querySelector<HTMLElement>('[data-br-cursor]');
  const star = cursor?.querySelector<HTMLElement>('[data-br-cursor-star]');
  const shape = star?.querySelector('svg');
  if (!holder || !cursor || !star || !shape) return;

  const mm = gsap.matchMedia();
  mm.add('(hover: hover) and (pointer: fine) and (min-width: 900px)', () => {
    holder.classList.add('has-cursor');
    const moveX = gsap.quickTo(cursor, 'x', { duration: reduce ? 0 : 0.35, ease: 'power3' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: reduce ? 0 : 0.35, ease: 'power3' });
    let shown = false;
    let px = -1, py = -1;

    const show = (next: boolean) => {
      if (next === shown) return;
      shown = next;
      gsap.to(cursor.children, { autoAlpha: next ? 1 : 0, duration: next ? 0.4 : 0.25, ease: next ? 'musesEase' : 'power2.out', overwrite: 'auto' });
    };

    // Visible seulement sur une diapositive (pas sur les flèches), et jamais pop-up ouverte
    const update = () => {
      if (px < 0) return show(false);
      const el = document.elementFromPoint(px, py);
      show(!!el?.closest('[data-service-slide]') && !el.closest('.service-slider-nav') && !document.documentElement.classList.contains('is-modal-open'));
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) { moveX(e.clientX, e.clientX); moveY(e.clientY, e.clientY); }
      px = e.clientX; py = e.clientY;
      moveX(px); moveY(py);
      update();
    };
    const onLeave = () => { px = -1; show(false); };

    // Déformation : l'étoile s'allonge selon la vitesse, orientée dans la direction du mouvement
    let lastX = 0, lastY = 0, stretch = 0, angle = 0;
    const tick = () => {
      const x = gsap.getProperty(cursor, 'x') as number;
      const y = gsap.getProperty(cursor, 'y') as number;
      const dx = x - lastX, dy = y - lastY;
      lastX = x; lastY = y;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.5) angle = Math.atan2(dy, dx) * (180 / Math.PI);
      stretch += (Math.min(speed / 40, 0.7) - stretch) * 0.25;
      // Étirement dans l'axe du mouvement, l'étoile elle-même reste droite (contre-rotation)
      gsap.set(star, { rotation: angle, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.55 });
      gsap.set(shape, { rotation: -angle });
    };
    if (!reduce) gsap.ticker.add(tick);

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', update, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    holder.addEventListener('click', () => requestAnimationFrame(update));
    return () => {
      holder.classList.remove('has-cursor');
      gsap.ticker.remove(tick);
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', update);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.set(cursor.children, { autoAlpha: 0 });
    };
  });
  document.addEventListener('astro:before-swap', () => mm.revert(), { once: true });
}

// ============ HERO : UNE IMAGE, DEUX FENÊTRES ============
// ============ NOM DE LA MARQUE : bloc centré, décalé façon Lysor Liane quand c'est possible ============
// Mesures réelles des mots (police chargée) :
//  - un mot trop large pour l'écran → la taille de police baisse jusqu'à ce qu'il tienne ;
//  - deux lignes : la 2e se décale vers la droite (443 px à 1440, 30 % de la largeur sur mobile),
//    réduit si besoin pour tenir ; si le décalage possible devient trop faible (mots longs),
//    les deux lignes sont simplement centrées l'une sous l'autre.
function fitMarqueTitle(title: HTMLElement) {
  const lines = [...title.querySelectorAll<HTMLElement>('[data-br-line]')];
  if (!lines.length) return;
  title.style.fontSize = '';
  title.style.removeProperty('--br-stagger');
  title.classList.remove('is-stacked');

  const avail = title.parentElement!.clientWidth - parseFloat(getComputedStyle(title.parentElement!).paddingLeft) - parseFloat(getComputedStyle(title.parentElement!).paddingRight);
  const widest = Math.max(...lines.map((l) => l.offsetWidth));
  if (widest > avail) {
    title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * (avail / widest) * 0.98}px`;
  }
  if (lines.length < 2) return;

  const w2 = lines[1].offsetWidth;
  const fpx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fpx')) || 1;
  const wanted = innerWidth < 900 ? avail * 0.3 : 443 * fpx;
  const possible = Math.min(wanted, avail - w2);
  if (possible < wanted * 0.5) title.classList.add('is-stacked');
  else title.style.setProperty('--br-stagger', `${possible}px`);
}

function initMarqueHero(hero: HTMLElement, reduce: boolean) {
  const title = hero.querySelector<HTMLElement>('[data-br-title]');
  if (title) {
    const fit = () => fitMarqueTitle(title);
    fit();
    document.fonts.ready.then(fit);
    ScrollTrigger.addEventListener('refreshInit', fit);
    document.addEventListener('astro:before-swap', () => ScrollTrigger.removeEventListener('refreshInit', fit), { once: true });
  }

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
    gsap.from(wins, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'musesReveal', stagger: 0.12, delay: 0.4 });
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
    gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'musesReveal', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });
}

// ============ POP-UP PRODUIT ============
function initMarqueModal(reduce: boolean) {
  const holder = document.querySelector<HTMLElement>('[data-br-products]');
  const modal = document.querySelector<HTMLElement>('[data-br-modal]');
  const slider = holder?.querySelector<HTMLElement>('[data-anim="service-slider"]');
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
    setTimeout(() => modal.querySelector<HTMLElement>('.br-close')?.focus({ preventScroll: true }), 50);
  };

  const marqueModalClose = () => {
    if (modal.hidden) return;
    const done = () => {
      modal.hidden = true;
      document.documentElement.classList.remove('is-modal-open');
      (window as any).__lenis?.start();
      // preventScroll : on rend le focus sans faire défiler la page jusqu'au slider
      marqueLastFocus?.focus({ preventScroll: true });
    };
    if (reduce) return done();
    gsap.to(veil, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' });
    gsap.to(dlg, { autoAlpha: 0, scale: 0.96, y: 16, duration: 0.45, ease: 'power2.out', onComplete: done });
  };

  slider.addEventListener('service-slide-click', (e) => {
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
