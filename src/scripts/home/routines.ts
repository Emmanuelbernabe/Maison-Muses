import { gsap } from 'gsap';
import { revealTitle } from '../shared/revealTitle';

export function initHomeRoutines() {
  const routines = document.getElementById('routines');
  if (!routines) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const routinesDoors = Array.from(routines.querySelectorAll<HTMLElement>('[data-anim="routines-door"]'));

  revealTitle(routines.querySelector<HTMLElement>('[data-anim="routines-title"]'));

  // ── Apparition des portes ──
  if (!reduce && routinesDoors.length) {
    gsap.fromTo(
      routinesDoors,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.6,
        ease: 'musesReveal',
        stagger: 0.12,
        scrollTrigger: { trigger: routines.querySelector('[data-anim="routines-doors"]'), start: 'top 85%', once: true },
      }
    );
  }

  initRoutinesModal(routinesDoors, reduce);

  // ── Desktop : la porte survolée s'ouvre (largeur en transform via GSAP, bandeau en CSS via .is-open) ──
  const mm = gsap.matchMedia();

  // Hauteur du bandeau de chaque porte, pour que la photo s'arrête juste au-dessus (voir .routines-door-img)
  const routinesBandObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const band = entry.target as HTMLElement;
      band.closest<HTMLElement>('.routines-door')?.style.setProperty('--routines-band', `${band.getBoundingClientRect().height}px`);
    });
  });
  routinesDoors.forEach((door) => {
    const band = door.querySelector<HTMLElement>('.routines-door-content');
    if (band) routinesBandObserver.observe(band);
  });
  document.addEventListener('astro:before-swap', () => routinesBandObserver.disconnect(), { once: true });

  mm.add('(min-width: 1024px)', () => {
    // ── Ouverture d'une porte, sans animer de propriété de mise en page ──
    // Animer flexGrow (largeur) faisait recalculer et arrondir au pixel la largeur, le cadrage de la photo
    // et le texte à chaque frame : en fin d'easing, les variations < 1 px produisaient un tremblement.
    // Ici : mise en page finale posée tout de suite, puis chaque porte part de son état visuel précédent
    // en transform (x + scaleX) jusqu'à scale 1. La photo et le texte reçoivent la contre-échelle
    // (variables CSS), la photo aussi le passage de son zoom de départ à son zoom final.
    const routinesImg = (door: HTMLElement) => door.querySelector<HTMLImageElement>('.routines-door-img');
    const routinesCover = new Map<HTMLElement, number>();   // zoom affiché de la photo (pour repartir d'où on en est)

    // Pose la photo à sa taille finale « cover » (une fois par ouverture, pas à chaque frame) ; renvoie son zoom
    const routinesFit = (door: HTMLElement) => {
      const img = routinesImg(door);
      if (!img?.naturalWidth) return 0;
      const cs = getComputedStyle(door);
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      const c = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const W = img.naturalWidth * c;
      const H = img.naturalHeight * c;
      Object.assign(img.style, { width: `${W}px`, height: `${H}px`, left: `${(w - W) / 2}px`, top: `${(h - H) * 0.3}px` });
      return c;
    };
    const routinesFitAll = () => routinesDoors.forEach((door) => routinesCover.set(door, routinesFit(door)));
    routinesFitAll();
    routinesDoors.forEach((door) => routinesImg(door)?.addEventListener('load', () => routinesCover.set(door, routinesFit(door))));

    const routinesSetVars = (door: HTMLElement, sx: number, k: number) => {
      door.style.setProperty('--routines-inv', String(1 / sx));
      door.style.setProperty('--routines-ikx', String(k / sx));
      door.style.setProperty('--routines-iky', String(k));
    };

    let routinesTween: gsap.core.Tween | null = null;

    const routinesOpenDoor = (door: HTMLElement) => {
      if (door.classList.contains('is-open')) return;

      // 1. État affiché actuel (transforms en cours compris, si une animation est interrompue)
      const first = routinesDoors.map((d) => d.getBoundingClientRect());
      const firstCover = routinesDoors.map((d) => routinesCover.get(d) || 0);
      routinesTween?.kill();

      // 2. Mise en page finale, immédiatement
      routinesDoors.forEach((d) => {
        const open = d === door;
        d.classList.toggle('is-open', open);
        gsap.set(d, { flexGrow: open ? 2.4 : 1, x: 0, scaleX: 1 });
        routinesSetVars(d, 1, 1);
      });
      const last = routinesDoors.map((d) => d.getBoundingClientRect());
      const lastCover = routinesDoors.map((d) => routinesFit(d));

      // 3. Écart à rattraper en transform (depuis le centre de chaque porte)
      const from = routinesDoors.map((_, i) => ({
        sx: first[i].width / last[i].width,
        x: first[i].left + first[i].width / 2 - (last[i].left + last[i].width / 2),
        k: lastCover[i] && firstCover[i] ? firstCover[i] / lastCover[i] : 1,
      }));

      const dpr = window.devicePixelRatio || 1;
      const snap = (v: number) => Math.round(v * dpr) / dpr;

      const routinesRender = (p: number) => {
        routinesDoors.forEach((d, i) => {
          const f = from[i];
          let sx = f.sx + (1 - f.sx) * p;
          let x = f.x * (1 - p);
          const k = f.k + (1 - f.k) * p;
          // Bords gauche et droit de la porte calés sur un pixel entier pendant l'animation :
          // sur un pixel à moitié couvert, le navigateur mélange photo et bandeau, et un liseré
          // de la photo apparaissait le long du texte. (À la fin, p = 1 : transform supprimé.)
          if (p < 1) {
            const c = last[i].left + last[i].width / 2;
            const L = snap(c + x - (sx * last[i].width) / 2);
            const R = snap(c + x + (sx * last[i].width) / 2);
            sx = (R - L) / last[i].width;
            x = (L + R) / 2 - c;
          }
          gsap.set(d, { x, scaleX: sx });
          routinesSetVars(d, sx, k);
          if (lastCover[i]) routinesCover.set(d, k * lastCover[i]);
        });
      };
      // Fin : plus aucun transform sur la porte, rendu net à sa taille réelle
      const routinesDone = () => {
        routinesRender(1);
        gsap.set(routinesDoors, { clearProps: 'x,scaleX,transform' });
      };

      if (reduce) return routinesDone();
      const routinesProgress = { p: 0 };
      routinesRender(0);
      routinesTween = gsap.to(routinesProgress, {
        p: 1,
        duration: 1,
        ease: 'musesEase',
        onUpdate: () => routinesRender(routinesProgress.p),
        onComplete: routinesDone,
      });
    };

    let routinesResizeTimer = 0;
    const routinesOnResize = () => { clearTimeout(routinesResizeTimer); routinesResizeTimer = window.setTimeout(routinesFitAll, 150); };
    window.addEventListener('resize', routinesOnResize);

    const routinesHandlers = routinesDoors.map((door) => {
      const routinesOnEnter = () => routinesOpenDoor(door);
      door.addEventListener('pointerenter', routinesOnEnter);
      door.addEventListener('focus', routinesOnEnter);
      return routinesOnEnter;
    });

    return () => {
      routinesDoors.forEach((door, i) => {
        door.removeEventListener('pointerenter', routinesHandlers[i]);
        door.removeEventListener('focus', routinesHandlers[i]);
      });
      window.removeEventListener('resize', routinesOnResize);
      routinesTween?.kill();
      gsap.set(routinesDoors, { clearProps: 'flexGrow,x,scaleX,transform' });
      routinesDoors.forEach((door) => {
        ['--routines-inv', '--routines-ikx', '--routines-iky'].forEach((v) => door.style.removeProperty(v));
        routinesImg(door)?.removeAttribute('style');   // mobile : la photo reprend son cadrage CSS
      });
    };
  });
}
// ── Pop-up Typeform : même apparition que la pop-up produit des pages marques (pages/brand.ts) ──
function initRoutinesModal(routinesDoors: HTMLElement[], reduce: boolean) {
  const modal = document.querySelector<HTMLElement>('[data-routines-modal]');
  if (!modal || !routinesDoors.length) return;
  const dlg = modal.querySelector<HTMLElement>('[data-routines-dlg]')!;
  const veil = modal.querySelector<HTMLElement>('.routines-veil')!;
  const iframe = modal.querySelector<HTMLIFrameElement>('[data-routines-iframe]')!;
  let routinesLastFocus: HTMLElement | null = null;

  const routinesModalOpen = (door: HTMLElement) => {
    const url = door.dataset.routinesForm;
    if (!url) return;
    routinesLastFocus = door;
    // Même formulaire qu'à la dernière ouverture : on le garde tel quel (réponses en cours conservées)
    if (iframe.dataset.src !== url) {
      iframe.dataset.src = url;
      iframe.src = url;
    }
    const title = door.dataset.routinesTitle || 'Diagnostic routine';
    modal.setAttribute('aria-label', title);
    iframe.title = title;

    modal.hidden = false;
    document.documentElement.classList.add('is-modal-open');
    (window as any).__lenis?.stop();
    // La pop-up s'ouvre depuis la porte cliquée
    const r = door.getBoundingClientRect();
    gsap.set(dlg, { transformOrigin: `${r.left + r.width / 2}px ${r.top + r.height / 2}px` });
    if (reduce) {
      gsap.set([veil, dlg], { clearProps: 'all' });
    } else {
      gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'musesEase' });
      gsap.fromTo(dlg, { clipPath: 'inset(46% 46% 46% 46% round 4px)', scale: 0.92, y: 24, autoAlpha: 0 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, y: 0, autoAlpha: 1, duration: 0.9, ease: 'musesEase' });
      gsap.fromTo(iframe, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'musesEase', delay: 0.35 });
    }
    setTimeout(() => modal.querySelector<HTMLElement>('.routines-close')?.focus({ preventScroll: true }), 50);
  };

  const routinesModalClose = () => {
    if (modal.hidden) return;
    const done = () => {
      modal.hidden = true;
      document.documentElement.classList.remove('is-modal-open');
      (window as any).__lenis?.start();
      routinesLastFocus?.focus({ preventScroll: true });
    };
    if (reduce) return done();
    gsap.to(veil, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' });
    gsap.to(dlg, { autoAlpha: 0, scale: 0.96, y: 16, duration: 0.45, ease: 'power2.out', onComplete: done });
  };

  // Le lien reste en place (sans JS, ou ctrl/cmd + clic : nouvel onglet) ; un clic simple ouvre la pop-up
  routinesDoors.forEach((door) => door.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    routinesModalOpen(door);
  }));
  modal.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-routines-close]')) routinesModalClose();
  });
  const routinesOnKey = (e: KeyboardEvent) => { if (e.key === 'Escape') routinesModalClose(); };
  document.addEventListener('keydown', routinesOnKey);
  // Changement de page avec la pop-up ouverte : on remet le scroll en route
  document.addEventListener('astro:before-swap', () => {
    document.removeEventListener('keydown', routinesOnKey);
    if (!modal.hidden) { (window as any).__lenis?.start(); document.documentElement.classList.remove('is-modal-open'); }
  }, { once: true });
}
