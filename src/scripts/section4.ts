import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSection4() {
  const s4 = document.getElementById('s4');
  if (!s4) return;

  const mm = gsap.matchMedia();

  // ── Titre : les mots s'allument un par un au scroll (opacité 0.15 → 1), desktop et mobile ──
  // Les mots sont déjà découpés en .s4-word dans le HTML : pas besoin de SplitText
  const s4Header = s4.querySelector<HTMLElement>('[data-anim="s4-header"]');
  const s4Words = s4.querySelectorAll<HTMLElement>('.s4-word');

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    if (!s4Header || !s4Words.length) return;
    gsap.from(s4Words, {
      opacity: 0.15,
      duration: 0.2,
      ease: 'none',
      stagger: 0.2,
      scrollTrigger: {
        trigger: s4Header,
        start: 'top 90%',
        end: 'bottom 50%',
        scrub: true,
      },
    });
  });

  // Desktop (min-width: 1024px)
  mm.add('(min-width: 1024px)', () => {
    // 2. Parallax des images à l'intérieur du conteneur (height à 110%)
    const parallaxImgs = s4.querySelectorAll<HTMLElement>('.s4-parallax-img');
    parallaxImgs.forEach((img) => {
      gsap.fromTo(img, {
        yPercent: -5,
      }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.s4-img-frame') || s4,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

 // 3. MUSES en bas à droite : apparition de droite à gauche, liée au scroll
const muses = s4.querySelector<HTMLElement>('[data-anim="s4-muses"]');
if (muses) {
  gsap.timeline({
    scrollTrigger: {
      trigger: muses,
      start: 'top bottom',        // commence quand MUSES entre par le bas de l'écran
      end: 'bottom 10%',             // finit quand il est monté aux deux tiers
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
    .fromTo(muses, { x: '8rem' }, { x: '-6rem', ease: 'ease.inOut', duration: 1 }, 0)}
  });

  // Mobile (< 1024px)
  mm.add('(max-width: 1023px)', () => {
    // MUSES : glisse de droite à gauche au scroll, en chevauchant la dernière photo
    const muses = s4.querySelector<HTMLElement>('[data-anim="s4-muses"]');
    if (muses) {
      gsap.fromTo(muses, { x: '3rem' }, {
        x: '-1rem',
        ease: 'none',
        scrollTrigger: {
          trigger: muses,
          start: 'top bottom',
          end: 'bottom 30%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
  });
}