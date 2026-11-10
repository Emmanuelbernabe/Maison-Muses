import { gsap } from 'gsap';
import { revealTitle } from './revealTitle';

export function initSection6() {
  const s6 = document.getElementById('s6');
  if (!s6) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealTitle(s6.querySelector<HTMLElement>('[data-anim="s6-title"]'));

  // ── Marquee des avis : boucle infinie, ralentie au survol ──
  const s6Marquee = s6.querySelector<HTMLElement>('[data-anim="s6-marquee"]');
  const s6Track = s6.querySelector<HTMLElement>('[data-anim="s6-track"]');

  if (s6Marquee && s6Track) {
    Array.from(s6Track.children).forEach((card) => {
      const s6Clone = card.cloneNode(true) as HTMLElement;
      s6Clone.setAttribute('aria-hidden', 'true');
      s6Track.appendChild(s6Clone);
    });

    if (!reduce) {
      const s6Loop = gsap.to(s6Track, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });

      // En pause quand le marquee n'est pas à l'écran
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) s6Loop.play();
        else s6Loop.pause();
      }).observe(s6Marquee);

      if (matchMedia('(hover: hover)').matches) {
        s6Marquee.addEventListener('pointerenter', () => gsap.to(s6Loop, { timeScale: 0.15, duration: 0.8, ease: 'power2.out' }));
        s6Marquee.addEventListener('pointerleave', () => gsap.to(s6Loop, { timeScale: 1, duration: 0.8, ease: 'power2.out' }));
      }
    }
  }

  // ── Note Planity : compteur au scroll ──
  const s6Note = s6.querySelector<HTMLElement>('[data-anim="s6-note"]');

  if (s6Note && !reduce) {
    const s6NoteTarget = parseFloat(s6Note.dataset.value ?? '0');
    const s6NoteValue = { val: 0 };
    s6Note.textContent = '0,0';

    gsap.to(s6NoteValue, {
      val: s6NoteTarget,
      duration: 1.6,
      ease: 'musesEase',
      scrollTrigger: { trigger: s6Note, start: 'top 85%', once: true },
      onUpdate: () => {
        s6Note.textContent = s6NoteValue.val.toFixed(1).replace('.', ',');
      },
    });
  }
}