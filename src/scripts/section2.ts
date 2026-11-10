/**
 * section2.ts — Scroll Hero → Section 2
 *
 * Architecture 100% native sans superposition forcée :
 * - Section 2 est une section normale dans le flux après la Hero
 * - L'image centrale est en position fixed : elle voyage de la hero (en bas) au centre de la section 2
 * - Chaque ligne de titre apparaît avec le masque overflow et l'animation demandée :
 *   fromTo({ y: "5rem", opacity: 0 }, { y: "0rem", duration: 0.8, opacity: 1, start: "bottom 95%" })
 * - Le bloc du haut et le bloc du bas entrent de façon synchronisée (100% opacité)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('musesEase', '0.22,1,0.36,1');

// ── Titre : même apparition que s5-intro-main, ligne par ligne dans son masque, rejouée au retour ──
function s2RevealLines(start = 'top 80%') {
  const titleBox = document.querySelector<HTMLElement>('[data-anim="s2-title-box"]');
  const lines = document.querySelectorAll<HTMLElement>('[data-anim="s2-line"]');
  if (!titleBox || !lines.length) return;
  gsap.fromTo(lines, { yPercent: 130 }, {
    yPercent: 0,
    duration: 1.2,
    ease: 'musesEase',
    stagger: 0.12,
    scrollTrigger: {
      trigger: titleBox,
      start,
      toggleActions: 'play none none reverse',
    },
  });
}

export function initSection2() {
  // ── Vidéo soin : chargée et lue seulement à l'approche de l'écran, en pause sinon ──
  const s2Video = document.querySelector<HTMLVideoElement>('.s2-video');
  if (s2Video) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) s2Video.play().catch(() => {});
      else s2Video.pause();
    }, { rootMargin: '100% 0px' }).observe(s2Video);
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const hero        = document.getElementById('hero');
    const s2          = document.getElementById('s2');
    const heroImg     = document.querySelector<HTMLElement>('[data-anim="hero-img"]');
    const load1Wrap   = document.querySelector<HTMLElement>('[data-anim="s2-load1"]');
    const load1Img    = load1Wrap?.querySelector<HTMLElement>('img');
    const lines       = document.querySelectorAll<HTMLElement>('[data-anim="s2-line"]');
    const follow = document.querySelector<HTMLElement>('[data-anim="s3-follow"]');

    if (!hero || !s2 || !heroImg) return;

    const vh   = () => window.innerHeight;
    const h    = () => heroImg.offsetHeight;
    const midY = () => -(vh() - h()) / 2;


    // ── 1. Voyage de l'image fixe : bas du viewport → centre vertical ──
  gsap.fromTo(heroImg, { y: 0 }, {
  y: midY,
  ease: 'none',
  scrollTrigger: {
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    invalidateOnRefresh: true,
  },
});
    // Révélation de load-1 par clip-path au scroll
    if (load1Wrap) {
      gsap.to(load1Wrap, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (load1Img) {
      gsap.to(load1Img, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // ── 2. Apparition ligne par ligne du titre dans la Section 2 ──
    s2RevealLines();

  // ── 4. s2 → s3 : le portrait sort par le haut, l'image du dessous monte au centre ──
const st = () => ({
  trigger: s2,
  start: 'top top',
  end: 'bottom top',
  scrub: true,
  invalidateOnRefresh: true,
});

gsap.fromTo(heroImg,
  { y: midY },
  { y: () => midY() - vh(), ease: 'none', immediateRender: false, scrollTrigger: st() },
);

  });

  // ── Mobile / tablette : le portrait descend du hero jusqu'en haut de la section 2 ──
  mm.add('(max-width: 1023px)', () => {
    const hero      = document.getElementById('hero');
    const s2        = document.getElementById('s2');
    const heroImg   = document.querySelector<HTMLElement>('[data-anim="hero-img"]');
    const slot      = document.querySelector<HTMLElement>('[data-anim="s2-slot"]');
    const load1Wrap = document.querySelector<HTMLElement>('[data-anim="s2-load1"]');
    const lines     = document.querySelectorAll<HTMLElement>('[data-anim="s2-line"]');

    if (!hero || !s2 || !heroImg || !slot) return;

    // Position dans la page, sans tenir compte des transforms en cours
    const s2DocTop = (el: HTMLElement) => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return y;
    };

    // L'emplacement de la section 2 prend exactement la taille du portrait
    const s2SyncSlot = () => {
      slot.style.width = `${heroImg.offsetWidth}px`;
      slot.style.height = `${heroImg.offsetHeight}px`;
    };
    s2SyncSlot();
    ScrollTrigger.addEventListener('refreshInit', s2SyncSlot);

    const s2Travel = () => s2DocTop(slot) - s2DocTop(heroImg);

    const heroScroll = () => ({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    });

    // 1. Le portrait glisse plus lentement que la page et se pose sur l'emplacement de la section 2
    gsap.fromTo(heroImg, { y: 0 }, { y: s2Travel, ease: 'none', scrollTrigger: heroScroll() });

    // 2. Révélation de load-1 par clip-path pendant le trajet
    if (load1Wrap) {
      gsap.fromTo(load1Wrap,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: heroScroll() },
      );
    }

    // 3. Apparition ligne par ligne du titre, quand il est bien à l'écran
    //    (plus tôt, elle se jouait encore en bas de l'écran, pendant la descente du portrait)
    s2RevealLines('top 55%');

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', s2SyncSlot);
      slot.style.width = '';
      slot.style.height = '';
    };
  });
}