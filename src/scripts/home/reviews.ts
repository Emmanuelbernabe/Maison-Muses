import { gsap } from 'gsap';
import { revealTitle } from '../shared/revealTitle';

export function initHomeReviews() {
  const reviews = document.getElementById('reviews');
  if (!reviews) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealTitle(reviews.querySelector<HTMLElement>('[data-anim="reviews-title"]'));

  // ── Marquee des avis : boucle infinie, ralentie au survol ──
  const reviewsMarquee = reviews.querySelector<HTMLElement>('[data-anim="reviews-marquee"]');
  const reviewsTrack = reviews.querySelector<HTMLElement>('[data-anim="reviews-track"]');

  if (reviewsMarquee && reviewsTrack) {
    Array.from(reviewsTrack.children).forEach((card) => {
      const reviewsClone = card.cloneNode(true) as HTMLElement;
      reviewsClone.setAttribute('aria-hidden', 'true');
      reviewsTrack.appendChild(reviewsClone);
    });

    if (!reduce) {
      const reviewsLoop = gsap.to(reviewsTrack, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });

      // En pause quand le marquee n'est pas à l'écran
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) reviewsLoop.play();
        else reviewsLoop.pause();
      }).observe(reviewsMarquee);

      if (matchMedia('(hover: hover)').matches) {
        reviewsMarquee.addEventListener('pointerenter', () => gsap.to(reviewsLoop, { timeScale: 0.15, duration: 0.8, ease: 'power2.out' }));
        reviewsMarquee.addEventListener('pointerleave', () => gsap.to(reviewsLoop, { timeScale: 1, duration: 0.8, ease: 'power2.out' }));
      }
    }
  }

  // ── Note Planity : compteur au scroll ──
  const reviewsNote = reviews.querySelector<HTMLElement>('[data-anim="reviews-note"]');

  if (reviewsNote && !reduce) {
    const reviewsNoteTarget = parseFloat(reviewsNote.dataset.value ?? '0');
    const reviewsNoteValue = { val: 0 };
    reviewsNote.textContent = '0,0';

    gsap.to(reviewsNoteValue, {
      val: reviewsNoteTarget,
      duration: 1.6,
      ease: 'musesEase',
      scrollTrigger: { trigger: reviewsNote, start: 'top 85%', once: true },
      onUpdate: () => {
        reviewsNote.textContent = reviewsNoteValue.val.toFixed(1).replace('.', ',');
      },
    });
  }
}