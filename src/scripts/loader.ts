/**
 * loader.ts — Maison Muses Loading Sequence
 *
 * Raccord 100% sans shift avec Hero.astro :
 * - Mesure en direct des éléments de la Hero (#hero-media, .hero-maison-wrap, .hero-muses-wrap)
 * - Dimensions Figma exactes en 1440px qui scalent proportionnellement (vw) :
 *     Image width: 28.12rem (31.25vw), height: 34.56rem (38.4vw), top: 19.18rem (21.31vw)
 * - Step 1 : MUSES overlap à seulement ~10.5% sur le flanc droit de l'image (ne déborde plus trop à gauche)
 * - Easing personnalisé : cubic-bezier(0.16, 1, 0.3, 1)
 */

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
const EXP_EASE = CustomEase.create('customExp', '0.16, 1, 0.3, 1');
const CLIP_EASE = 'power2.out';

export async function initLoader(onHeroTransition?: () => void): Promise<void> {
  return new Promise(async (resolve) => {
    const loader = document.getElementById('loader');
    if (!loader) { resolve(); return; }

    const cream       = document.getElementById('ld-cream') as HTMLElement;
    const musesLayerOrange = document.getElementById('ld-muses-layer-orange') as HTMLElement;
    const zone        = document.getElementById('ld-zone') as HTMLElement;
    const img1        = document.getElementById('ld-img-1') as HTMLElement;
    const img2        = document.getElementById('ld-img-2') as HTMLElement;
    const img3        = document.getElementById('ld-img-3') as HTMLElement;
    const img4        = document.getElementById('ld-img-4') as HTMLElement;
    const imgHero     = document.getElementById('ld-img-hero') as HTMLElement;

    const maisonWhite  = document.getElementById('ld-maison-white') as HTMLElement;
    const maisonOrange = document.getElementById('ld-maison-orange') as HTMLElement;
    const musesWhite   = document.getElementById('ld-muses-white') as HTMLElement;
    const musesOrange  = document.getElementById('ld-muses-orange') as HTMLElement;
    const hd           = document.getElementById('hd');

    document.body.style.overflow = 'hidden';
    await document.fonts.ready;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;

    // ── Mesures exactes sur les éléments de la Hero en place ──
    const heroMedia = document.getElementById('hero-media');
    const heroMaisonWrap = document.querySelector('.hero-maison-wrap') as HTMLElement;
    const heroMusesWrap = document.querySelector('.hero-muses-wrap') as HTMLElement;
    const heroMaisonWord = document.querySelector('.hero-maison') as HTMLElement;
    const heroMusesWord = document.querySelector('.hero-muses') as HTMLElement;

    let imgFinalW: number;
    let imgFinalH: number;
    let imgFinalLeft: number;
    let imgFinalTop: number;

    if (heroMedia) {
      const r = heroMedia.getBoundingClientRect();
      imgFinalW = r.width;
      imgFinalH = r.height;
      imgFinalLeft = r.left;
      imgFinalTop = r.top;
    } else {
      imgFinalH = Math.min((vw * 38.4) / 100, vh * 0.643);
      imgFinalW = imgFinalH * (28.12 / 34.56);
      imgFinalLeft = (vw - imgFinalW) / 2;
      imgFinalTop = vh - imgFinalH;
    }

    let maisonFinalTop: number;
    let maisonFsFinal: number;
    if (heroMaisonWrap && heroMaisonWord) {
      const r = heroMaisonWrap.getBoundingClientRect();
      maisonFinalTop = r.top;
      maisonFsFinal = parseFloat(getComputedStyle(heroMaisonWord).fontSize) || ((vw * 28.2) / 100);
    } else {
      maisonFsFinal = (vw * 28.2) / 100;
      maisonFinalTop = imgFinalTop - 0.36 * maisonFsFinal;
    }

    let musesFinalLeft: number;
    let musesFinalTop: number;
    let musesFsFinal: number;
    if (heroMusesWrap && heroMusesWord) {
      const r = heroMusesWrap.getBoundingClientRect();
      musesFinalLeft = r.left;
      musesFinalTop = r.top;
      musesFsFinal = parseFloat(getComputedStyle(heroMusesWord).fontSize) || Math.min((vw * 8.333) / 100, imgFinalH * 0.22);
    } else {
      musesFsFinal = Math.min((vw * 8.333) / 100, imgFinalH * 0.22);
      musesFinalLeft = vw / 2 + imgFinalW / 2 - 0.11 * imgFinalW;
      musesFinalTop = vh - imgFinalH * 0.22;
    }

    // ── Tailles et positions initiales (Step 1) ──
    // MAISON : 15rem à 1440px => 16.667vw
    const maisonFsInit  = (vw * 16.667) / 100;
    // MUSES : 6.25rem à 1440px => 6.944vw
    const musesFsInit   = (vw * 6.944) / 100;

    // Image initiale au centre (14.25rem x 17.5rem à 1440px => ~15.833vw x ~19.444vw)
    const imgInitW = (vw * 15.833) / 100;
    const imgInitH = imgInitW * (17.5 / 14.25);

    const zoneInitTop  = (vh - imgInitH) / 2;
    const zoneInitLeft = (vw - imgInitW) / 2;

    // MAISON au Step 1 : au-dessus de l'image, descendant légèrement sur le haut
    const maisonInitTop = zoneInitTop - 0.25 * maisonFsInit;

    // MUSES au Step 1 : overlap discret sur le bord droit (~8% de l'image, ne déborde plus trop à gauche)
    const musesInitLeft = vw / 2 + imgInitW / 2 - 0.08 * imgInitW;
    const musesInitTop  = zoneInitTop + imgInitH * 0.58;

    // Mi-chemin pour l'animation
    const maisonFsMid   = maisonFsInit + (maisonFsFinal - maisonFsInit) * 0.5;
    const musesFsMid    = musesFsInit  + (musesFsFinal  - musesFsInit)  * 0.5;
    const maisonMidTop  = maisonInitTop + (maisonFinalTop - maisonInitTop) * 0.5;
    const musesMidLeft  = musesInitLeft + (musesFinalLeft - musesInitLeft) * 0.5;
    const musesMidTop   = musesInitTop  + (musesFinalTop  - musesInitTop)  * 0.5;

    // ── Initialisations GSAP ──
    gsap.set([img1, img2, img3, img4, imgHero], { clipPath: 'inset(50% 50% 50% 50%)' });
    // Le crème et le muses orange commencent masqués depuis le bas
    gsap.set([cream, musesLayerOrange], { clipPath: 'inset(100% 0% 0% 0%)' });

         gsap.set(zone, {
      top: imgFinalTop,
      left: imgFinalLeft,
      bottom: 'auto',
      width: imgFinalW,
      height: imgFinalH,
      borderRadius: 0,
      transformOrigin: '0% 0%',
      xPercent: 0,
      yPercent: 0,
      x: zoneInitLeft - imgFinalLeft,
      y: zoneInitTop - imgFinalTop,
      scaleX: imgInitW / imgFinalW,
      scaleY: imgInitH / imgFinalH,
      force3D: true,
    });


  gsap.set([maisonWhite, maisonOrange], {
      visibility: 'visible',
      fontSize: maisonFsFinal,
      top: maisonFinalTop,
      bottom: 'auto',
      left: '50%',
      x: 0,
      xPercent: -50,
      transformOrigin: '50% 0%',
      y: maisonInitTop - maisonFinalTop,
      scale: maisonFsInit / maisonFsFinal,
      force3D: true,
    });

      gsap.set([musesWhite, musesOrange], {
      visibility: 'visible',
      fontSize: musesFsFinal,
      top: musesFinalTop,
      bottom: 'auto',
      left: musesFinalLeft,
      transformOrigin: '0% 0%',
      xPercent: 0,
      yPercent: 0,
      x: musesInitLeft - musesFinalLeft,
      y: musesInitTop - musesFinalTop,
      scale: musesFsInit / musesFsFinal,
      force3D: true,
    });

    if (hd) {
      gsap.set(hd, { y: -50, opacity: 0 });
    }

    const tl = gsap.timeline();

    // ── Phase 1 : Clip-paths concentriques 1, 2, 3 ──
    tl.addLabel('images', 0.4)
      .fromTo(img1, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)',         duration: 0.85, ease: CLIP_EASE }, 'images')
      .fromTo(img2, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(4.5% 4.5% 4.5% 4.5%)', duration: 0.85, ease: CLIP_EASE }, 'images+=0.45')
      .fromTo(img3, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(9% 9% 9% 9%)',         duration: 0.85, ease: CLIP_EASE }, 'images+=0.90')

    // ── Phase 2 : Révélation de la dernière image + resize + déplacement vers la taille/position finale (Easing cubic-bezier(0.16, 1, 0.3, 1)) ──
    tl.addLabel('lastImage', 'images+=1.35')
      .fromTo([img4, imgHero],
        { clipPath: 'inset(50% 50% 50% 50%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: EXP_EASE },
        'lastImage')

      // Grossissement et déplacement de l'image
      .to(zone, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 1.35,
        ease: EXP_EASE,
        force3D: true,
      }, 'lastImage')

      // Grossissement du texte MAISON
     .to([maisonWhite, maisonOrange], {
        y: maisonMidTop - maisonFinalTop,
        scale: maisonFsMid / maisonFsFinal,
        duration: 1.35,
        ease: EXP_EASE,
        force3D: true,
      }, 'lastImage')

      // Grossissement du texte MUSES
        .to([musesWhite, musesOrange], {
        x: musesMidLeft - musesFinalLeft,
        y: musesMidTop - musesFinalTop,
        scale: musesFsMid / musesFsFinal,
        duration: 1.35,
        ease: EXP_EASE,
        force3D: true,
      }, 'lastImage')

    // ── Phase 3 : Dévoilement du fond DU BAS VERS LE HAUT (Easing cubic-bezier(0.16, 1, 0.3, 1)) ──
    tl.addLabel('reveal', 'lastImage+=1.20')
      // Background qui remonte
      .to([cream, musesLayerOrange], {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.25,
        ease: EXP_EASE,
      }, 'reveal')

      // Grossissement final de MAISON
       .to([maisonWhite, maisonOrange], {
        y: 0,
        scale: 1,
        duration: 1.25,
        ease: EXP_EASE,
        force3D: true,
      }, 'reveal')
      // Grossissement final de MUSES
       .to([musesWhite, musesOrange], {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.25,
        ease: EXP_EASE,
        force3D: true,
      }, 'reveal')

    // ── Apparition du menu de navigation du haut vers le bas juste après que le bg orange soit entièrement remonté ──
    if (hd) {
      tl.to(hd, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: EXP_EASE,
        onStart: () => hd.classList.add('hd-ready'),
      }, 'reveal+=1.25');
    }

    // ── Phase 4 : Transition sans shift ──
    tl.addLabel('finish', 'reveal+=1.25')
      .call(() => {
        if (onHeroTransition) onHeroTransition();
      }, undefined, 'finish')
      .to(loader, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        onComplete: () => {
          loader.classList.add('ld-done');
          document.body.style.overflow = '';
          resolve();
        },
      }, 'finish');
  });
}
