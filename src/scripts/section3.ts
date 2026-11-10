import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSection3() {
  const s3 = document.getElementById('s3');
  const track = s3?.querySelector<HTMLElement>('[data-anim="s3-track"]');
  const follow = document.querySelector<HTMLElement>('[data-anim="s3-follow"]');
  if (!s3 || !track) return;

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
  let s3Visible = true;
  let s3Running = false;
  new IntersectionObserver(([entry]) => {
    s3Visible = entry.isIntersecting;
    if (!s3Visible) loop.pause();
    else if (s3Running) loop.play();
  }).observe(s3);

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
  const s2 = document.getElementById('s2');
  if (!follow || !s2) return;

  // Qui est visible ? Déduit UNIQUEMENT de la position de scroll, aucun état mémorisé.
  //  avant s2         → ni l'une ni l'autre
  //  pendant la sortie de s2 (progress entre 0 et 1) → image fixe, cachée derrière le portrait
  //  à partir du marquee (progress = 1)             → image du marquee uniquement
  const place = (self: ScrollTrigger) => {
    const p = self.progress;
    gsap.set(follow, { autoAlpha: p > 0 && p < 1 ? 1 : 0 });
    gsap.set(center, { autoAlpha: p === 1 ? 1 : 0 });
  };

  ScrollTrigger.create({
    trigger: s2,
    start: 'top top',
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: place,
    onToggle: place,
    onRefresh: place,
  });

  // Zoom arrière de l'image pendant la sortie de s2 : 1.4 → 1
const followImg = follow.querySelector<HTMLElement>('img');
if (followImg) {
  gsap.fromTo(followImg,
    { scale: 1.4 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: s2,
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
    if (on === s3Running) return; s3Running = on;
    loop.pause();
    gsap.killTweensOf(loop);
    if (on && s3Visible) loop.play();
    else gsap.to(loop, {
      time: loop.duration(), duration: 0.6, ease: 'power2.out',
      onComplete: () => { loop.pause(0); },
    });
  };
  const sync = (self: ScrollTrigger) => run(self.progress === 1);

  // gsap.timeline({
  //   scrollTrigger: {
  //     trigger: s3, start: 'top top', end: '+=90%',
  //     pin: true, scrub: true, invalidateOnRefresh: true,
  //     onUpdate: sync, onRefresh: sync,
  //   },
  // }).fromTo(sides, { y: () => window.innerHeight * 0.5 }, { y: 0, ease: 'none' });

  const OFFSET = () => window.innerHeight * 0.35;   // distance de montée des images latérales

gsap.timeline({
  scrollTrigger: {
    trigger: s3,
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
    s3Running = true;
    if (s3Visible) loop.play();
    return () => {
      s3Running = false;
      loop.pause(0);
    };
  });
}