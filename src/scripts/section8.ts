import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealTitle } from './revealTitle';

export function initSection8() {
  const s8 = document.getElementById('s8');
  if (!s8) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealTitle(s8.querySelector<HTMLElement>('[data-anim="s8-title"]'));

  // ── Aperçu image qui suit le curseur (desktop) ──
  const s8List = s8.querySelector<HTMLElement>('[data-anim="s8-list"]');
  const s8Preview = s8.querySelector<HTMLElement>('[data-anim="s8-preview"]');
  const mm = gsap.matchMedia();

 mm.add('(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
    if (!s8List || !s8Preview) return;

    const s8PreviewImgs = Array.from(s8Preview.querySelectorAll<HTMLElement>('.s8-preview-img'));
    gsap.set(s8Preview, { xPercent: -50, yPercent: -50, scale: 0.85, autoAlpha: 0 });
    const s8PreviewX = gsap.quickTo(s8Preview, 'x', { duration: 0.6, ease: 'power3' });
    const s8PreviewY = gsap.quickTo(s8Preview, 'y', { duration: 0.6, ease: 'power3' });

    let s8ActiveIndex: string | null = null;
    let s8PointerX = -1;
    let s8PointerY = -1;

    const s8ShowPreview = (index: string) => {
      if (s8ActiveIndex === null) {
        s8PreviewX(s8PointerX, s8PointerX);
        s8PreviewY(s8PointerY, s8PointerY);
        gsap.to(s8Preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'musesEase', overwrite: 'auto' });
      }
      if (s8ActiveIndex !== index) {
        s8PreviewImgs.forEach((img) => {
          gsap.set(img, { opacity: img.dataset.index === index ? 1 : 0 });
        });
        s8ActiveIndex = index;
      }
    };

    const s8HidePreview = () => {
      if (s8ActiveIndex === null) return;
      s8ActiveIndex = null;
      gsap.to(s8Preview, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    };

    const s8UpdatePreview = () => {
      if (s8PointerX < 0) return;
      const s8Hovered = document.elementFromPoint(s8PointerX, s8PointerY)?.closest<HTMLElement>('.s8-item');
      if (s8Hovered && s8List.contains(s8Hovered)) s8ShowPreview(s8Hovered.dataset.index ?? '');
      else s8HidePreview();
    };

    const s8OnPointerMove = (event: PointerEvent) => {
      s8PointerX = event.clientX;
      s8PointerY = event.clientY;
      s8UpdatePreview();
      if (s8ActiveIndex !== null) {
        s8PreviewX(s8PointerX);
        s8PreviewY(s8PointerY);
      }
    };

    const s8OnPageLeave = () => {
      s8PointerX = -1;
      s8HidePreview();
    };

    window.addEventListener('pointermove', s8OnPointerMove, { passive: true });
    window.addEventListener('scroll', s8UpdatePreview, { passive: true });
    document.documentElement.addEventListener('pointerleave', s8OnPageLeave);

    return () => {
      window.removeEventListener('pointermove', s8OnPointerMove);
      window.removeEventListener('scroll', s8UpdatePreview);
      document.documentElement.removeEventListener('pointerleave', s8OnPageLeave);
      gsap.set(s8Preview, { autoAlpha: 0 });
    };
  });

  // ── Filtres Tout / Articles / Podcast ──
  const s8Filters = Array.from(s8.querySelectorAll<HTMLButtonElement>('.s8-filter'));
  const s8AllItems = Array.from(s8.querySelectorAll<HTMLElement>('.s8-item'));

  s8Filters.forEach((button) => {
    button.addEventListener('click', () => {
      const s8ActiveFilter = button.dataset.filter;
      s8Filters.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));

      gsap.to(s8AllItems, {
        autoAlpha: 0,
        y: 12,
        duration: reduce ? 0 : 0.25,
        overwrite: true,
        onComplete: () => {
          const s8VisibleItems = s8AllItems.filter((item) => {
            const s8IsVisible = s8ActiveFilter === 'all' || item.dataset.type === s8ActiveFilter;
            item.style.display = s8IsVisible ? '' : 'none';
            return s8IsVisible;
          });

          gsap.to(s8VisibleItems, {
            autoAlpha: 1,
            y: 0,
            duration: reduce ? 0 : 0.6,
            ease: 'musesEase',
            stagger: reduce ? 0 : 0.06,
          });

          ScrollTrigger.refresh();
        },
      });
    });
  });
}
