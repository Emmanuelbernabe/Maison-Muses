import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Vidéo du portrait du hero : elle ne tourne que lorsqu'elle peut être vue.
// Le portrait est recouvert par l'image de l'intro au fil du scroll du hero (home/intro.ts),
// entièrement quand le bas du hero atteint le haut de l'écran. Zone de lecture : du haut de la page
// jusqu'à un quart d'écran après ce point, pour qu'en remontant elle reparte juste avant de réapparaître.
// En pause aussi quand l'onglet est caché. Pas de lecture auto si l'utilisateur réduit les animations.
export function initHomeHero() {
  const hero = document.getElementById('hero');
  const video = document.querySelector<HTMLVideoElement>('[data-anim="hero-video"]');
  if (!hero || !video) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    return;
  }

  let heroInView = true;
  const heroSync = () => {
    if (heroInView && !document.hidden) video.play().catch(() => {});
    else video.pause();
  };

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom -25%',
    onToggle: (self) => { heroInView = self.isActive; heroSync(); },
  });
  heroInView = st.isActive;
  heroSync();

  document.addEventListener('visibilitychange', heroSync);
  document.addEventListener('astro:before-swap', () => document.removeEventListener('visibilitychange', heroSync), { once: true });
}
