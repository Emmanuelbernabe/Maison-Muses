import { gsap } from 'gsap';
import '../shared/revealTitle';   // courbes « musesEase » / « musesReveal »

/* ───────── Fenêtre « Réserver » : choix du salon (components/layout/BookingModal.astro) ─────────
   Ouverture par le bouton RESERVER du header : le panneau s'ouvre en clip-path depuis le haut,
   les éléments entrent en cascade, les photos se dévoilent de haut en bas. Échap, le voile ou la croix ferment.
   La tabulation reste dans la fenêtre ; à la fermeture, le focus revient sur le bouton. */
export function initBooking() {
  const modal = document.querySelector<HTMLElement>('[data-bk]');
  const openers = Array.from(document.querySelectorAll<HTMLElement>('[data-bk-open]'));
  if (!modal || !openers.length) return;
  const dlg = modal.querySelector<HTMLElement>('[data-bk-dlg]')!;
  const veil = modal.querySelector<HTMLElement>('.bk-veil')!;
  const items = modal.querySelectorAll<HTMLElement>('[data-bk-in]');
  const clips = modal.querySelectorAll<HTMLElement>('[data-bk-clip]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFocus: HTMLElement | null = null;
  let isOpen = false;

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement as HTMLElement;
    modal.hidden = false;
    document.documentElement.classList.add('is-modal-open');
    (window as any).__lenis?.stop();
    modal.querySelectorAll<HTMLImageElement>('img').forEach((img) => { img.loading = 'eager'; });
    if (!reduce) {
      gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(dlg, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' });
      gsap.fromTo(items, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.1 });
      gsap.fromTo(clips, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'musesReveal', stagger: 0.1, delay: 0.2 });
    }
    // Focus sur la croix une fois l'en-tête visible (masqué au tout début de l'animation d'entrée)
    setTimeout(() => modal.querySelector<HTMLElement>('.bk-close')?.focus({ preventScroll: true }), reduce ? 0 : 200);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    const done = () => {
      modal.hidden = true;
      document.documentElement.classList.remove('is-modal-open');
      (window as any).__lenis?.start();
      lastFocus?.focus({ preventScroll: true });
    };
    if (reduce) return done();
    gsap.to(veil, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(dlg, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.in', onComplete: done });
  };

  openers.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  modal.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-bk-close]')) close(); });

  const onKey = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = Array.from(dlg.querySelectorAll<HTMLElement>('a[href], button'));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('astro:before-swap', () => {
    document.removeEventListener('keydown', onKey);
    if (isOpen) { (window as any).__lenis?.start(); document.documentElement.classList.remove('is-modal-open'); }
  }, { once: true });
}
