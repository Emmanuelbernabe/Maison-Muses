import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Les images se dévoilent de haut en bas
const CLIP_HIDDEN = 'inset(0% 0% 100% 0%)';
const CLIP_FULL = 'inset(0% 0% 0% 0%)';

// Page Espace coiffure : chaque bloc ne fait rien s'il n'est pas sur la page
export function initCoiffure() {
  initCoiffureHero();
  initCoiffureApproach();
  initCoiffureSlider();
  initCoiffureAccordion();
}

const coiffureReduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ HERO ============
function initCoiffureHero() {
  const hero = document.querySelector<HTMLElement>('[data-anim="cf-hero"]');
  if (!hero) return;
  const hd = document.getElementById('hd');

  if (!coiffureReduce()) {
    gsap.from(hero.querySelectorAll('[data-cf-in]'), {
      y: 24,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 1.2,
      ease: 'musesEase',
      stagger: 0.12,
      delay: 0.3,
      clearProps: 'filter',
    });
  }

  // Header crème tant que la vidéo est sous lui
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top+=40',
    onToggle: (self) => hd?.classList.toggle('is-on-orange', self.isActive),
  });
}

// ============ NOTRE APPROCHE ============
function initCoiffureApproach() {
  const title = document.querySelector<HTMLElement>('[data-anim="cf-fill"]');
  if (!title) return;
  const section = title.closest('section');
  if (!section || coiffureReduce()) return;

  // Titre : les mots s'allument un par un au scroll (même animation que le titre de la section 4)
  gsap.from(title.querySelectorAll('.cf-word'), {
    opacity: 0.15,
    duration: 0.2,
    ease: 'none',
    stagger: 0.2,
    scrollTrigger: {
      trigger: title,
      start: 'top 80%',
      end: 'bottom 30%',
      scrub: true,
    },
  });

  section.querySelectorAll<HTMLElement>('[data-cf-fade]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      ease: 'musesEase',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  });

  // Grande photo uniquement : la petite n'a pas de clip-path
  section.querySelectorAll<HTMLElement>('[data-cf-clip]').forEach((el) => {
    gsap.fromTo(el, { clipPath: CLIP_HIDDEN }, {
      clipPath: CLIP_FULL,
      duration: 1.1,
      ease: 'musesEase',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });
}

// ============ SLIDER : centré, en boucle, glissable, parallaxe (sans Swiper) ============
function initCoiffureSlider() {
  // Plusieurs sliders possibles (pages espace, pages marques)
  document.querySelectorAll<HTMLElement>('[data-anim="cf-slider"]').forEach(initCoiffureSliderOne);
}

function initCoiffureSliderOne(slider: HTMLElement) {
  const slides = [...slider.querySelectorAll<HTMLElement>('[data-cf-slide]')];
  const count = slides.length;
  if (!count) return;

  const reduce = coiffureReduce();
  const sliderState = { pos: 0 };   // position continue : 0 = première diapositive au centre
  let slideW = 0;
  let slideGap = 0;
  let slideStep = 0;

  // Place chaque diapositive selon son écart au centre, en boucle
  const sliderRender = () => {
    const centerX = slider.clientWidth / 2;
    slides.forEach((slide, i) => {
      const offset = gsap.utils.wrap(-count / 2, count / 2, i - sliderState.pos);
      gsap.set(slide, { x: centerX - slideW / 2 + offset * slideStep });
      // Parallaxe : l'image glisse moins vite que sa diapositive (± 25 % à une diapositive du centre)
      const img = slide.querySelector<HTMLElement>('img');
      if (!img) return;
      const amount = Number(img.dataset.parallaxX || 25) / 100;
      gsap.set(img, { x: -gsap.utils.clamp(-1.5, 1.5, offset) * amount * slideW });
    });
  };

  const sliderMeasure = () => {
    slideGap = innerWidth < 768 ? 16 : 32;   // spaceBetween : 16, puis 32 dès 768
    // Desktop : la diapositive du centre et ses deux voisines remplissent exactement la largeur
    slideW = Math.round(innerWidth < 768 ? innerWidth * 0.72 : (slider.clientWidth - 2 * slideGap) / 3);
    slideStep = slideW + slideGap;
    slider.style.setProperty('--slide-w', `${slideW}px`);
    sliderRender();
  };

  const sliderGoTo = (target: number) => {
    gsap.to(sliderState, {
      pos: target,
      duration: reduce ? 0 : 0.8,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: sliderRender,
    });
  };

  // ── Flèches et clavier ──
  slider.querySelector('[data-cf-next]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sliderGoTo(Math.round(sliderState.pos) + 1);
  });
  slider.querySelector('[data-cf-prev]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sliderGoTo(Math.round(sliderState.pos) - 1);
  });
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); sliderGoTo(Math.round(sliderState.pos) + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); sliderGoTo(Math.round(sliderState.pos) - 1); }
    if (e.key === 'Enter') {
      const index = gsap.utils.wrap(0, count, Math.round(sliderState.pos));
      slider.dispatchEvent(new CustomEvent('cf-slide-click', { detail: { index, slide: slides[index] } }));
    }
  });

  // ── Glisser à la souris ou au doigt, avec élan au lâcher ──
  let sliderDragging = false;
  let dragStartX = 0;
  let dragStartPos = 0;
  let dragLastX = 0;
  let dragLastTime = 0;
  let dragVelocity = 0;

  slider.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    sliderDragging = true;
    dragStartX = dragLastX = e.clientX;
    dragStartPos = sliderState.pos;
    dragLastTime = performance.now();
    dragVelocity = 0;
    gsap.killTweensOf(sliderState);
    slider.classList.add('is-dragging');
    slider.setPointerCapture(e.pointerId);
  });

  slider.addEventListener('pointermove', (e) => {
    if (!sliderDragging) return;
    const now = performance.now();
    dragVelocity = (e.clientX - dragLastX) / Math.max(1, now - dragLastTime);
    dragLastX = e.clientX;
    dragLastTime = now;
    sliderState.pos = dragStartPos - (e.clientX - dragStartX) / slideStep;
    sliderRender();
  });

  const sliderRelease = (e: PointerEvent) => {
    if (!sliderDragging) return;
    sliderDragging = false;
    // Simple clic (pas de glissé) sur une diapositive : on prévient la page (ex. pop-up produit)
    if (Math.abs(e.clientX - dragStartX) < 6 && e.type === 'pointerup') {
      const hit = slides.find((slide) => {
        const r = slide.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      });
      if (hit) slider.dispatchEvent(new CustomEvent('cf-slide-click', { detail: { index: Number(hit.dataset.index), slide: hit } }));
    }
    slider.classList.remove('is-dragging');
    // Un geste rapide avance d'une diapositive de plus
    sliderGoTo(Math.round(sliderState.pos - (dragVelocity * 180) / slideStep));
  };
  slider.addEventListener('pointerup', sliderRelease);
  slider.addEventListener('pointercancel', sliderRelease);

  sliderMeasure();
  // Suit la taille du slider (s'arrête de lui-même quand la page change)
  new ResizeObserver(sliderMeasure).observe(slider);

  // Apparition des diapositives de haut en bas, toutes en même temps
  if (!reduce) {
    gsap.fromTo(slides, { clipPath: CLIP_HIDDEN }, {
      clipPath: CLIP_FULL,
      duration: 1.1,
      ease: 'musesEase',
      scrollTrigger: { trigger: slider, start: 'top 85%', once: true },
    });
  }
}

// ============ ACCORDÉON (un seul ouvert à la fois) + MARQUES ============
function initCoiffureAccordion() {
  const acc = document.querySelector<HTMLElement>('[data-anim="cf-acc"]');
  if (!acc) return;
  const reduce = coiffureReduce();
  const rows = [...acc.querySelectorAll<HTMLElement>('[data-cf-row]')];

  const accSetOpen = (row: HTMLElement, open: boolean) => {
    const btn = row.querySelector<HTMLElement>('.cf-row-btn');
    const detail = row.querySelector<HTMLElement>('.cf-detail');
    if (!btn || !detail) return;
    row.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    detail.toggleAttribute('inert', !open);
    gsap.fromTo(detail, { height: detail.offsetHeight }, {
      height: open ? 'auto' : 0,
      duration: reduce ? 0 : open ? 0.8 : 0.5,
      ease: open ? 'musesEase' : 'power2.inOut',
      onComplete: () => ScrollTrigger.refresh(),   // la page a changé de hauteur
    });
    if (!open || reduce) return;
    const photo = detail.querySelector<HTMLElement>('[data-cf-acc-clip]');
    if (photo) gsap.fromTo(photo, { clipPath: CLIP_HIDDEN }, { clipPath: CLIP_FULL, duration: 1, ease: 'musesEase', delay: 0.15 });
    gsap.fromTo(detail.querySelectorAll('.cf-detail-text > *, .cf-brands'), { y: 20, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.8, ease: 'musesEase', stagger: 0.07, delay: 0.1,
    });
  };

  rows.forEach((row) => {
    row.querySelector('.cf-row-btn')?.addEventListener('click', () => {
      const wasOpen = row.classList.contains('is-open');
      rows.forEach((r) => { if (r.classList.contains('is-open')) accSetOpen(r, false); });
      if (!wasOpen) accSetOpen(row, true);
    });
  });

  // Photo de la consultation (ouverte au départ) : dévoilée à son arrivée à l'écran
  const firstPhoto = acc.querySelector<HTMLElement>('.cf-row.is-open [data-cf-acc-clip]');
  if (firstPhoto && !reduce) {
    gsap.fromTo(firstPhoto, { clipPath: CLIP_HIDDEN }, {
      clipPath: CLIP_FULL, duration: 1.1, ease: 'musesEase',
      scrollTrigger: { trigger: firstPhoto, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  }

  // Marques en défilement continu (la liste est doublée dans le HTML)
  const brandsTrack = acc.querySelector<HTMLElement>('[data-cf-brands]');
  if (brandsTrack && !reduce) gsap.to(brandsTrack, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
}
