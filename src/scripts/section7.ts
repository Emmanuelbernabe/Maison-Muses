import { gsap } from 'gsap';
import { revealTitle } from './revealTitle';

export function initSection7() {
  const s7 = document.getElementById('s7');
  if (!s7) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s7Doors = Array.from(s7.querySelectorAll<HTMLElement>('[data-anim="s7-door"]'));

  revealTitle(s7.querySelector<HTMLElement>('[data-anim="s7-title"]'));

  // ── Apparition des portes ──
  if (!reduce && s7Doors.length) {
    gsap.fromTo(
      s7Doors,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'musesEase',
        stagger: 0.12,
        scrollTrigger: { trigger: s7.querySelector('[data-anim="s7-doors"]'), start: 'top 85%', once: true },
      }
    );
  }

  // ── Desktop : la porte survolée s'ouvre (largeur en transform via GSAP, bandeau en CSS via .is-open) ──
  const mm = gsap.matchMedia();

  // Hauteur du bandeau de chaque porte, pour que la photo s'arrête juste au-dessus (voir .s7-door-img)
  const s7BandObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const band = entry.target as HTMLElement;
      band.closest<HTMLElement>('.s7-door')?.style.setProperty('--s7-band', `${band.getBoundingClientRect().height}px`);
    });
  });
  s7Doors.forEach((door) => {
    const band = door.querySelector<HTMLElement>('.s7-door-content');
    if (band) s7BandObserver.observe(band);
  });
  document.addEventListener('astro:before-swap', () => s7BandObserver.disconnect(), { once: true });

  mm.add('(min-width: 1024px)', () => {
    // ── Ouverture d'une porte, sans animer de propriété de mise en page ──
    // Animer flexGrow (largeur) faisait recalculer et arrondir au pixel la largeur, le cadrage de la photo
    // et le texte à chaque frame : en fin d'easing, les variations < 1 px produisaient un tremblement.
    // Ici : mise en page finale posée tout de suite, puis chaque porte part de son état visuel précédent
    // en transform (x + scaleX) jusqu'à scale 1. La photo et le texte reçoivent la contre-échelle
    // (variables CSS), la photo aussi le passage de son zoom de départ à son zoom final.
    const s7Img = (door: HTMLElement) => door.querySelector<HTMLImageElement>('.s7-door-img');
    const s7Cover = new Map<HTMLElement, number>();   // zoom affiché de la photo (pour repartir d'où on en est)

    // Pose la photo à sa taille finale « cover » (une fois par ouverture, pas à chaque frame) ; renvoie son zoom
    const s7Fit = (door: HTMLElement) => {
      const img = s7Img(door);
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
    const s7FitAll = () => s7Doors.forEach((door) => s7Cover.set(door, s7Fit(door)));
    s7FitAll();
    s7Doors.forEach((door) => s7Img(door)?.addEventListener('load', () => s7Cover.set(door, s7Fit(door))));

    const s7SetVars = (door: HTMLElement, sx: number, k: number) => {
      door.style.setProperty('--s7-inv', String(1 / sx));
      door.style.setProperty('--s7-ikx', String(k / sx));
      door.style.setProperty('--s7-iky', String(k));
    };

    let s7Tween: gsap.core.Tween | null = null;

    const s7OpenDoor = (door: HTMLElement) => {
      if (door.classList.contains('is-open')) return;

      // 1. État affiché actuel (transforms en cours compris, si une animation est interrompue)
      const first = s7Doors.map((d) => d.getBoundingClientRect());
      const firstCover = s7Doors.map((d) => s7Cover.get(d) || 0);
      s7Tween?.kill();

      // 2. Mise en page finale, immédiatement
      s7Doors.forEach((d) => {
        const open = d === door;
        d.classList.toggle('is-open', open);
        gsap.set(d, { flexGrow: open ? 2.4 : 1, x: 0, scaleX: 1 });
        s7SetVars(d, 1, 1);
      });
      const last = s7Doors.map((d) => d.getBoundingClientRect());
      const lastCover = s7Doors.map((d) => s7Fit(d));

      // 3. Écart à rattraper en transform (depuis le centre de chaque porte)
      const from = s7Doors.map((_, i) => ({
        sx: first[i].width / last[i].width,
        x: first[i].left + first[i].width / 2 - (last[i].left + last[i].width / 2),
        k: lastCover[i] && firstCover[i] ? firstCover[i] / lastCover[i] : 1,
      }));

      const dpr = window.devicePixelRatio || 1;
      const snap = (v: number) => Math.round(v * dpr) / dpr;

      const s7Render = (p: number) => {
        s7Doors.forEach((d, i) => {
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
          s7SetVars(d, sx, k);
          if (lastCover[i]) s7Cover.set(d, k * lastCover[i]);
        });
      };
      // Fin : plus aucun transform sur la porte, rendu net à sa taille réelle
      const s7Done = () => {
        s7Render(1);
        gsap.set(s7Doors, { clearProps: 'x,scaleX,transform' });
      };

      if (reduce) return s7Done();
      const s7Progress = { p: 0 };
      s7Render(0);
      s7Tween = gsap.to(s7Progress, {
        p: 1,
        duration: 1,
        ease: 'musesEase',
        onUpdate: () => s7Render(s7Progress.p),
        onComplete: s7Done,
      });
    };

    let s7ResizeTimer = 0;
    const s7OnResize = () => { clearTimeout(s7ResizeTimer); s7ResizeTimer = window.setTimeout(s7FitAll, 150); };
    window.addEventListener('resize', s7OnResize);

    const s7Handlers = s7Doors.map((door) => {
      const s7OnEnter = () => s7OpenDoor(door);
      door.addEventListener('pointerenter', s7OnEnter);
      door.addEventListener('focus', s7OnEnter);
      return s7OnEnter;
    });

    return () => {
      s7Doors.forEach((door, i) => {
        door.removeEventListener('pointerenter', s7Handlers[i]);
        door.removeEventListener('focus', s7Handlers[i]);
      });
      window.removeEventListener('resize', s7OnResize);
      s7Tween?.kill();
      gsap.set(s7Doors, { clearProps: 'flexGrow,x,scaleX,transform' });
      s7Doors.forEach((door) => {
        ['--s7-inv', '--s7-ikx', '--s7-iky'].forEach((v) => door.style.removeProperty(v));
        s7Img(door)?.removeAttribute('style');   // mobile : la photo reprend son cadrage CSS
      });
    };
  });
}