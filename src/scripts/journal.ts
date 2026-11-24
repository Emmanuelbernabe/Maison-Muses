import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Journal : hub (filtres) et article (apparitions) ; ne fait rien ailleurs
export function initJournal() {
  const hub = document.querySelector<HTMLElement>('[data-anim="jr-hub"]');
  const article = document.querySelector<HTMLElement>('[data-anim="jr-article"]');
  if (!hub && !article) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============ APPARITIONS ============
  if (!reduce) {
    // Parallaxe dans les images (couverture, cartes, « À lire aussi », photos du texte),
    // comme sur le reste du site : l'image glisse dans son cadre pendant le défilement
    document.querySelectorAll<HTMLElement>('[data-jr-parallax]').forEach((frame) => {
      const img = frame.querySelector('img');
      if (!img) return;
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Corps de l'article : chaque bloc du richtext en fondu
    document.querySelectorAll<HTMLElement>('[data-jr-body] > *').forEach((el) => {
      gsap.from(el, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'musesEase',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
      });
    });
  }

  // ============ PLAYER AUDIO (podcast) ============
  document.querySelectorAll<HTMLElement>('[data-jr-player]').forEach(initJournalPlayer);

  // ============ FILTRES DU HUB ============
  const filters = hub?.querySelector<HTMLElement>('[data-jr-filters]');
  if (!hub || !filters) return;
  const jrButtons = [...filters.querySelectorAll<HTMLButtonElement>('button')];
  const jrCards = [...hub.querySelectorAll<HTMLElement>('[data-jr-grid] [data-jr-card]')];

  jrButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      jrButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const jrFilter = btn.dataset.filter;
      jrCards.forEach((card) => { card.hidden = jrFilter !== 'all' && card.dataset.cat !== jrFilter; });
      const visible = jrCards.filter((card) => !card.hidden);
      if (!reduce) {
        gsap.fromTo(visible, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'musesEase', stagger: 0.06 });
      }
      ScrollTrigger.refresh();   // la page a changé de hauteur (footer) : parallaxes recalculées
    });
  });
}

const jrTime = (s: number) => {
  if (!Number.isFinite(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

function initJournalPlayer(player: HTMLElement) {
  const audio = player.querySelector<HTMLAudioElement>('[data-jr-audio]');
  const playBtn = player.querySelector<HTMLButtonElement>('[data-jr-play]');
  const seek = player.querySelector<HTMLInputElement>('[data-jr-seek]');
  const current = player.querySelector<HTMLElement>('[data-jr-current]');
  const duration = player.querySelector<HTMLElement>('[data-jr-duration]');
  const rateBtn = player.querySelector<HTMLButtonElement>('[data-jr-rate]');
  if (!audio || !playBtn || !seek || !current || !duration) return;

  const JR_RATES = [1, 1.25, 1.5, 2];
  let jrSeeking = false;

  const jrUpdate = () => {
    const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
    if (!jrSeeking) seek.value = String(Math.round(ratio * 1000));
    player.style.setProperty('--jr-p', `${(Number(seek.value) / 10).toFixed(2)}%`);
    current.textContent = jrTime(audio.currentTime);
    seek.setAttribute('aria-valuetext', `${jrTime(audio.currentTime)} sur ${jrTime(audio.duration)}`);
  };

  audio.addEventListener('loadedmetadata', () => { duration.textContent = jrTime(audio.duration); jrUpdate(); });
  audio.addEventListener('timeupdate', jrUpdate);
  audio.addEventListener('play', () => { player.classList.add('is-playing'); playBtn.setAttribute('aria-label', 'Mettre l’épisode en pause'); });
  audio.addEventListener('pause', () => { player.classList.remove('is-playing'); playBtn.setAttribute('aria-label', 'Lire l’épisode'); });
  audio.addEventListener('ended', () => { audio.currentTime = 0; jrUpdate(); });

  playBtn.addEventListener('click', () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });

  // Barre : glisser pour se déplacer dans l'épisode
  seek.addEventListener('input', () => {
    jrSeeking = true;
    player.style.setProperty('--jr-p', `${(Number(seek.value) / 10).toFixed(2)}%`);
    if (audio.duration) current.textContent = jrTime((Number(seek.value) / 1000) * audio.duration);
  });
  seek.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    jrSeeking = false;
  });

  player.querySelectorAll<HTMLButtonElement>('[data-jr-skip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const end = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + 30;
      audio.currentTime = Math.min(end, Math.max(0, audio.currentTime + Number(btn.dataset.jrSkip)));
      jrUpdate();
    });
  });

  rateBtn?.addEventListener('click', () => {
    const next = JR_RATES[(JR_RATES.indexOf(audio.playbackRate) + 1) % JR_RATES.length];
    audio.playbackRate = next;
    rateBtn.textContent = `${String(next).replace('.', ',')}×`;
    rateBtn.setAttribute('aria-label', `Vitesse de lecture : ${String(next).replace('.', ',')} fois`);
  });

  // Changement de page (View Transitions) : on coupe le son, la page n'est plus là
  document.addEventListener('astro:before-swap', () => audio.pause(), { once: true });
}
