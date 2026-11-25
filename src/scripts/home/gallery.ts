import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHomeGallery() {
  const gallery = document.getElementById('gallery');
  const track = gallery?.querySelector<HTMLElement>('[data-anim="gallery-track"]');
  const follow = document.querySelector<HTMLElement>('[data-anim="gallery-follow"]');
  if (!gallery || !track) return;

  const items = Array.from(track.children) as HTMLElement[];
  const center = items.find((el) => el.hasAttribute('data-center'))!;
  const sides = items.filter((el) => el !== center);
  // largeur d'un groupe = distance entre l'item 0 et son jumeau du 2e groupe
  const loopW = () => items[items.length / 2].offsetLeft - items[0].offsetLeft;

  const loop = gsap.to(track, {
    x: () => -loopW(), duration: 25, ease: 'none', repeat: -1,
    paused: true, invalidateOnRefresh: true,
  });

  // ── Marquee en pause quand la section n'est pas à l'écran ──
  let galleryVisible = true;
  let galleryRunning = false;
  new IntersectionObserver(([entry]) => {
    galleryVisible = entry.isIntersecting;
    if (!galleryVisible) loop.pause();
    else if (galleryRunning) loop.play();
  }).observe(gallery);

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
  const intro = document.getElementById('intro');
  if (!follow || !intro) return;

  // Qui est visible ? Déduit UNIQUEMENT de la position de scroll, aucun état mémorisé.
  //  avant intro         → ni l'une ni l'autre
  //  pendant la sortie de intro (progress entre 0 et 1) → image fixe, cachée derrière le portrait
  //  à partir du marquee (progress = 1)             → image du marquee uniquement
  const place = (self: ScrollTrigger) => {
    const p = self.progress;
    gsap.set(follow, { autoAlpha: p > 0 && p < 1 ? 1 : 0 });
    gsap.set(center, { autoAlpha: p === 1 ? 1 : 0 });
  };

  ScrollTrigger.create({
    trigger: intro,
    start: 'top top',
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: place,
    onToggle: place,
    onRefresh: place,
  });

  // Zoom arrière de l'image pendant la sortie de intro : 1.4 → 1
const followImg = follow.querySelector<HTMLElement>('img');
if (followImg) {
  gsap.fromTo(followImg,
    { scale: 1.4 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: intro,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}

  // Marquee : démarre quand le pin est terminé, se remet en place proprement au retour arrière
  const run = (on: boolean) => {
    if (on === galleryRunning) return; galleryRunning = on;
    loop.pause();
    gsap.killTweensOf(loop);
    if (on && galleryVisible) loop.play();
    else gsap.to(loop, {
      time: loop.duration(), duration: 0.6, ease: 'power2.out',
      onComplete: () => { loop.pause(0); },
    });
  };
  const sync = (self: ScrollTrigger) => run(self.progress === 1);

  // gsap.timeline({
  //   scrollTrigger: {
  //     trigger: gallery, start: 'top top', end: '+=90%',
  //     pin: true, scrub: true, invalidateOnRefresh: true,
  //     onUpdate: sync, onRefresh: sync,
  //   },
  // }).fromTo(sides, { y: () => window.innerHeight * 0.5 }, { y: 0, ease: 'none' });

  const OFFSET = () => window.innerHeight * 0.35;   // distance de montée des images latérales

gsap.timeline({
  scrollTrigger: {
    trigger: gallery,
    start: 'top top',
    end: () => '+=' + OFFSET() * 0.7,
    pin: true, scrub: true, invalidateOnRefresh: true,
    onUpdate: sync, onRefresh: sync,
  },
}).fromTo(sides, { y: OFFSET }, { y: 0, ease: 'none' });
});

  // Mobile : pas de pin, marquee direct
  mm.add('(max-width: 1023px)', () => {
    gsap.set(center, { autoAlpha: 1 });
    galleryRunning = true;
    if (galleryVisible) loop.play();
    return () => {
      galleryRunning = false;
      loop.pause(0);
    };
  });
}