/**
 * intro.ts — Scroll Hero → Intro
 *
 * Architecture 100% native sans superposition forcée :
 * - L'intro est une section normale dans le flux après la Hero
 * - L'image centrale est en position fixed : elle voyage de la hero (en bas) au centre de l'intro
 * - Chaque ligne de titre apparaît avec le masque overflow et l'animation demandée :
 *   fromTo({ y: "5rem", opacity: 0 }, { y: "0rem", duration: 0.8, opacity: 1, start: "bottom 95%" })
 * - Le bloc du haut et le bloc du bas entrent de façon synchronisée (100% opacité)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('musesEase', '0.22,1,0.36,1');

// ── Titre : même apparition que coffrets-intro-main, ligne par ligne dans son masque, rejouée au retour ──
function introRevealLines(start = 'top 80%') {
  const titleBox = document.querySelector<HTMLElement>('[data-anim="intro-title-box"]');
  const lines = document.querySelectorAll<HTMLElement>('[data-anim="intro-line"]');
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

export function initHomeIntro() {
  // ── Vidéo soin : chargée et lue seulement à l'approche de l'écran, en pause sinon ──
  const introVideo = document.querySelector<HTMLVideoElement>('.intro-video');
  if (introVideo) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) introVideo.play().catch(() => {});
      else introVideo.pause();
    }, { rootMargin: '100% 0px' }).observe(introVideo);
  }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const hero        = document.getElementById('hero');
    const intro          = document.getElementById('intro');
    const heroImg     = document.querySelector<HTMLElement>('[data-anim="hero-img"]');
    const load1Wrap   = document.querySelector<HTMLElement>('[data-anim="intro-load1"]');
    const load1Img    = load1Wrap?.querySelector<HTMLElement>('img');
    const lines       = document.querySelectorAll<HTMLElement>('[data-anim="intro-line"]');
    const follow = document.querySelector<HTMLElement>('[data-anim="gallery-follow"]');

    if (!hero || !intro || !heroImg) return;

    const vh   = () => window.innerHeight;
    const h    = () => heroImg.offsetHeight;
    const midY = () => -(vh() - h()) / 2;


    // ── 1. Voyage de l'image fixe : bas du viewport → centre vertical ──
  gsap.fromTo(heroImg, { y: 0 }, {
  y: midY,
  snap: { y: 1 },   // déplacement au pixel entier : sinon 1px de vidéo dépassait sous l'image en bas
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

    // ── 2. Apparition ligne par ligne du titre de l'intro ──
    introRevealLines();

  // ── 4. intro → gallery : le portrait sort par le haut, l'image du dessous monte au centre ──
const st = () => ({
  trigger: intro,
  start: 'top top',
  end: 'bottom top',
  scrub: true,
  invalidateOnRefresh: true,
});

gsap.fromTo(heroImg,
  { y: midY },
  { y: () => midY() - vh(), snap: { y: 1 }, ease: 'none', immediateRender: false, scrollTrigger: st() },
);

  });

  // ── Mobile / tablette : le portrait descend du hero jusqu'en haut de l'intro ──
  mm.add('(max-width: 1023px)', () => {
    const hero      = document.getElementById('hero');
    const intro        = document.getElementById('intro');
    const heroImg   = document.querySelector<HTMLElement>('[data-anim="hero-img"]');
    const slot      = document.querySelector<HTMLElement>('[data-anim="intro-slot"]');
    const load1Wrap = document.querySelector<HTMLElement>('[data-anim="intro-load1"]');
    const lines     = document.querySelectorAll<HTMLElement>('[data-anim="intro-line"]');

    if (!hero || !intro || !heroImg || !slot) return;

    // Position dans la page, sans tenir compte des transforms en cours
    const introDocTop = (el: HTMLElement) => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return y;
    };

    // L'emplacement de l'intro prend exactement la taille du portrait
    const introSyncSlot = () => {
      slot.style.width = `${heroImg.offsetWidth}px`;
      slot.style.height = `${heroImg.offsetHeight}px`;
    };
    introSyncSlot();
    ScrollTrigger.addEventListener('refreshInit', introSyncSlot);

    const introTravel = () => introDocTop(slot) - introDocTop(heroImg);

    const heroScroll = () => ({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    });

    // 1. Le portrait glisse plus lentement que la page et se pose sur l'emplacement de l'intro
    gsap.fromTo(heroImg, { y: 0 }, { y: introTravel, snap: { y: 1 }, ease: 'none', scrollTrigger: heroScroll() });

    // 2. Révélation de load-1 par clip-path pendant le trajet
    if (load1Wrap) {
      gsap.fromTo(load1Wrap,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: heroScroll() },
      );
    }

    // 3. Apparition ligne par ligne du titre, quand il est bien à l'écran
    //    (plus tôt, elle se jouait encore en bas de l'écran, pendant la descente du portrait)
    introRevealLines('top 55%');

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', introSyncSlot);
      slot.style.width = '';
      slot.style.height = '';
    };
  });
}