import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealTitle } from '../shared/revealTitle';

export function initHomeJournal() {
  const journal = document.getElementById('journal');
  if (!journal) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealTitle(journal.querySelector<HTMLElement>('[data-anim="journal-title"]'));

  // ── Aperçu image qui suit le curseur (desktop) ──
  const journalList = journal.querySelector<HTMLElement>('[data-anim="journal-list"]');
  const journalPreview = journal.querySelector<HTMLElement>('[data-anim="journal-preview"]');
  const mm = gsap.matchMedia();

 mm.add('(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
    if (!journalList || !journalPreview) return;

    const journalPreviewImgs = Array.from(journalPreview.querySelectorAll<HTMLElement>('.journal-preview-img'));
    gsap.set(journalPreview, { xPercent: -50, yPercent: -50, scale: 0.85, autoAlpha: 0 });
    const journalPreviewX = gsap.quickTo(journalPreview, 'x', { duration: 0.6, ease: 'power3' });
    const journalPreviewY = gsap.quickTo(journalPreview, 'y', { duration: 0.6, ease: 'power3' });

    let journalActiveIndex: string | null = null;
    let journalPointerX = -1;
    let journalPointerY = -1;

    const journalShowPreview = (index: string) => {
      if (journalActiveIndex === null) {
        journalPreviewX(journalPointerX, journalPointerX);
        journalPreviewY(journalPointerY, journalPointerY);
        gsap.to(journalPreview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'musesEase', overwrite: 'auto' });
      }
      if (journalActiveIndex !== index) {
        journalPreviewImgs.forEach((img) => {
          gsap.set(img, { opacity: img.dataset.index === index ? 1 : 0 });
        });
        journalActiveIndex = index;
      }
    };

    const journalHidePreview = () => {
      if (journalActiveIndex === null) return;
      journalActiveIndex = null;
      gsap.to(journalPreview, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    };

    const journalUpdatePreview = () => {
      if (journalPointerX < 0) return;
      const journalHovered = document.elementFromPoint(journalPointerX, journalPointerY)?.closest<HTMLElement>('.journal-item');
      if (journalHovered && journalList.contains(journalHovered)) journalShowPreview(journalHovered.dataset.index ?? '');
      else journalHidePreview();
    };

    const journalOnPointerMove = (event: PointerEvent) => {
      journalPointerX = event.clientX;
      journalPointerY = event.clientY;
      journalUpdatePreview();
      if (journalActiveIndex !== null) {
        journalPreviewX(journalPointerX);
        journalPreviewY(journalPointerY);
      }
    };

    const journalOnPageLeave = () => {
      journalPointerX = -1;
      journalHidePreview();
    };

    window.addEventListener('pointermove', journalOnPointerMove, { passive: true });
    window.addEventListener('scroll', journalUpdatePreview, { passive: true });
    document.documentElement.addEventListener('pointerleave', journalOnPageLeave);

    return () => {
      window.removeEventListener('pointermove', journalOnPointerMove);
      window.removeEventListener('scroll', journalUpdatePreview);
      document.documentElement.removeEventListener('pointerleave', journalOnPageLeave);
      gsap.set(journalPreview, { autoAlpha: 0 });
    };
  });

  // ── Filtres Tout / Articles / Podcast ──
  const journalFilters = Array.from(journal.querySelectorAll<HTMLButtonElement>('.journal-filter'));
  const journalAllItems = Array.from(journal.querySelectorAll<HTMLElement>('.journal-item'));

  journalFilters.forEach((button) => {
    button.addEventListener('click', () => {
      const journalActiveFilter = button.dataset.filter;
      journalFilters.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));

      gsap.to(journalAllItems, {
        autoAlpha: 0,
        y: 12,
        duration: reduce ? 0 : 0.25,
        overwrite: true,
        onComplete: () => {
          const journalVisibleItems = journalAllItems.filter((item) => {
            const journalIsVisible = journalActiveFilter === 'all' || item.dataset.type === journalActiveFilter;
            item.style.display = journalIsVisible ? '' : 'none';
            return journalIsVisible;
          });

          gsap.to(journalVisibleItems, {
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
