import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealTitle } from '../shared/revealTitle';

const CLIP_EASE = 'musesReveal';   // révélations d'images : courbe commune (shared/revealTitle.ts)
const CENTER = 'inset(50% 50% 50% 50%)';
const FULL = 'inset(0% 0% 0% 0%)';

// Page L'équipe : le hero d'abord (son pin doit exister avant celui du relais), puis Moussine / Violaine
export function initEquipe() {
  initEquipeHero();
  initEquipeMembers();
}

function initEquipeHero() {
  const eq = document.getElementById('eq');
  const slot = eq?.querySelector<HTMLElement>('[data-anim="eq-slot"]');
  const layer = eq?.querySelector<HTMLElement>('[data-anim="eq-layer"]');
  const inner = eq?.querySelector<HTMLElement>('[data-anim="eq-inner"]');
  const video = eq?.querySelector<HTMLVideoElement>('[data-anim="eq-video"]');
  const playBtn = eq?.querySelector<HTMLButtonElement>('[data-anim="eq-play"]');
  const playLabel = eq?.querySelector<HTMLElement>('[data-anim="eq-play-label"]');
  if (!eq || !slot || !layer || !inner || !video || !playBtn || !playLabel) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hd = document.getElementById('hd');
  const photoV = eq.querySelector<HTMLElement>('.eq-photo-v');
  const photoM = eq.querySelector<HTMLElement>('.eq-photo-m');
  const photos = [photoV, photoM].filter(Boolean) as HTMLElement[];
  const d = (s: number) => (reduce ? 0 : s);
  const eqTexts = ['.eq-title', '.eq-muses', '.eq-logo', '.eq-para', '.eq-deux']
    .map((sel) => eq.querySelector<HTMLElement>(sel))
    .filter(Boolean) as HTMLElement[];

  // Paragraphe d'intro : même apparition ligne par ligne que les titres de la home
  // (en mobile, les retours à la ligne de la maquette desktop sont retirés : le texte se répartit seul)
  const eqPara = eq.querySelector<HTMLElement>('.eq-para');
  if (eqPara && matchMedia('(max-width: 899px)').matches) eqPara.querySelectorAll('br').forEach((br) => br.remove());
  revealTitle(eqPara);

  // ── Rectangle de l'emplacement, mesuré dans le calque vidéo ──
  const eqSlotInset = () => {
    const l = layer.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    return `inset(${s.top - l.top}px ${l.right - s.right}px ${l.bottom - s.bottom}px ${s.left - l.left}px)`;
  };
  // Même rectangle réduit à son centre : départ de l'apparition
  const eqSlotCenter = () => {
    const l = layer.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    const cy = s.top + s.height / 2 - l.top;
    const cx = s.left + s.width / 2 - l.left;
    return `inset(${cy}px ${l.width - cx}px ${l.height - cy}px ${cx}px)`;
  };

  // ── Ouverture complète de la vidéo ──
  // Desktop : tout l'écran. Mobile : une bande 16:9 sur toute la largeur, centrée (au plus la hauteur de l'écran),
  // pour voir la vidéo en entier plutôt qu'un recadrage plein écran
  const rotateHint = eq.querySelector<HTMLElement>('[data-anim="eq-rotate"]');
  const eqIsMobile = () => matchMedia('(max-width: 899px)').matches;
  const eqBand = () => (eqIsMobile() ? Math.min(layer.offsetWidth * 9 / 16, layer.offsetHeight) : layer.offsetHeight);
  const eqOpenInset = () => {
    const gap = Math.max(0, (layer.offsetHeight - eqBand()) / 2);
    return `inset(${gap}px 0px ${gap}px 0px)`;
  };

  // Header en crème seulement si la vidéo ouverte passe sous lui (desktop, mobile tourné) ; en bande au milieu
  // de l'écran (mobile en portrait), il reste orange sur le fond crème
  const eqUnderHeader = () => (layer.offsetHeight - eqBand()) / 2 < (hd?.offsetHeight ?? 80);

  const mm = gsap.matchMedia();

  // ============ APPARITION + AGRANDISSEMENT ============
  // Desktop et mobile : même composition (recalée en CSS), même apparition, même agrandissement
  mm.add('all', () => {
    gsap.set(layer, { clipPath: eqSlotInset });

    // Apparition de droite à gauche : Violaine, Moussine, puis la vidéo
    gsap.timeline({ delay: 0.3 })
      .fromTo(photoV, { clipPath: CENTER }, { clipPath: FULL, duration: d(1.6), ease: CLIP_EASE }, 0)
      .fromTo(photoM, { clipPath: CENTER }, { clipPath: FULL, duration: d(1.6), ease: CLIP_EASE }, d(0.25))
      .fromTo(inner, { clipPath: eqSlotCenter }, {
        clipPath: eqSlotInset,
        duration: d(1.6),
        ease: CLIP_EASE,
             onComplete: () => { gsap.set(inner, { clipPath: 'none' }); },   // ensuite, seul le calque découpe
      }, d(0.5))
      // Apparition terminée : on recalcule toutes les positions, puis on prévient la section Moussine / Violaine
      .call(() => {
        ScrollTrigger.refresh();
        window.dispatchEvent(new Event('eq:ready'));
      });

    // Scroll : la vidéo s'ouvre en plein écran, le bouton play se dévoile
    gsap.timeline({
      scrollTrigger: {
        trigger: eq,
        start: 'bottom bottom',
        end: '+=110%',
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => hd?.classList.toggle('is-on-orange', eqUnderHeader() && self.isActive && self.progress > 0.85),
        onLeave: () => hd?.classList.remove('is-on-orange'),
        onEnterBack: (self) => hd?.classList.toggle('is-on-orange', eqUnderHeader() && self.progress > 0.85),
        onLeaveBack: () => hd?.classList.remove('is-on-orange'),
      },
    })
      .fromTo(layer, { clipPath: eqSlotInset }, { clipPath: eqOpenInset, ease: 'none', immediateRender: false }, 0)
      // Mobile : la vidéo (16:9) se resserre en bande pour être vue en entier, sans recadrage
      .fromTo(video, { top: 0, height: () => layer.offsetHeight }, { top: () => (layer.offsetHeight - eqBand()) / 2, height: eqBand, ease: 'none', immediateRender: false }, 0)
      // Mobile en portrait : invitation à tourner le téléphone, sous la bande, en fin d'ouverture
      // (finit en même temps que l'ouverture, 0,5 : la durée totale, donc le rythme du scroll, ne change pas)
      .fromTo([rotateHint].filter(Boolean), { opacity: 0, y: 12 }, { opacity: () => (eqIsMobile() ? 1 : 0), y: 0, duration: 0.12, ease: 'none', immediateRender: false }, 0.38)
      // Pendant que la vidéo s'ouvre, le reste remonte et s'efface
      .fromTo(photos, { yPercent: 0, opacity: 1 }, { yPercent: -60, opacity: 0, ease: 'none', stagger: 0.03, immediateRender: false }, 0)
      .fromTo(eqTexts, { y: 0, opacity: 1 }, { y: -80, opacity: 0, ease: 'none', immediateRender: false }, 0);

    return () => hd?.classList.remove('is-on-orange');
  });

  // ============ SURVOL : 2e photo qui se dévoile depuis le centre ============
  photos.forEach((fig) => {
    const hover = fig.querySelector<HTMLElement>('.eq-hover');
    if (!hover) return;
    // Une seule valeur (0 à 50 %) appliquée aux 4 côtés : ouverture et fermeture toujours depuis le centre
    const eqHoverState = { p: 50 };
    const eqApply = () => { hover.style.clipPath = `inset(${eqHoverState.p}% ${eqHoverState.p}% ${eqHoverState.p}% ${eqHoverState.p}%)`; };
    eqApply();
    const eqShow = () => gsap.to(eqHoverState, { p: 0, duration: d(1.2), ease: CLIP_EASE, overwrite: true, onUpdate: eqApply });
    const eqHide = () => gsap.to(eqHoverState, { p: 50, duration: d(0.6), ease: 'power2.inOut', overwrite: true, onUpdate: eqApply });
    let eqShown = false;
    fig.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') eqShow(); });
    fig.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') eqHide(); });
    fig.addEventListener('focus', eqShow);
    fig.addEventListener('blur', eqHide);
    // Tactile : un appui alterne entre les deux photos
    fig.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      eqShown = !eqShown;
      if (eqShown) eqShow(); else eqHide();
    });
  });

  // ============ LECTEUR : aperçu muet en boucle → lecture avec le son, pause, reprise ============
  const eqLabel = (text: string, aria: string) => {
    playLabel.textContent = text;
    playBtn.setAttribute('aria-label', aria);
    // Icône pause (deux barres) quand le bouton propose « Pause », icône play sinon
    playBtn.dataset.state = text === 'Pause' ? 'playing' : 'paused';
  };
  // Retour à l'aperçu muet en boucle (fin de la vidéo, ou retour tout en haut de la page)
  const eqPreview = (label = 'Lire la vidéo') => {
    video.muted = true;
    video.loop = true;
    video.play().catch(() => {});
    eqLabel(label, 'Lire la vidéo de présentation avec le son');
  };

  playBtn.addEventListener('click', () => {
    if (video.muted) {
      // Depuis l'aperçu : lecture depuis le début, avec le son, une seule fois
      video.muted = false;
      video.loop = false;
      video.currentTime = 0;
      video.play().catch(() => eqPreview());   // lecture refusée par le navigateur : on revient à l'aperçu
      eqLabel('Pause', 'Mettre la vidéo en pause');
    } else if (video.paused) {
      video.play().catch(() => {});            // reprise là où on s'était arrêté
      eqLabel('Pause', 'Mettre la vidéo en pause');
    } else {
      video.pause();
      eqLabel('Reprendre', 'Reprendre la vidéo');
    }
  });

  // Filet de sécurité : le libellé suit aussi l'état réel de la vidéo (pause ou lecture déclenchée ailleurs)
  video.addEventListener('play', () => { if (!video.muted) eqLabel('Pause', 'Mettre la vidéo en pause'); });
  video.addEventListener('pause', () => { if (!video.muted && !video.ended) eqLabel('Reprendre', 'Reprendre la vidéo'); });

  // Vidéo terminée : elle redevient un aperçu muet, le bouton propose de la revoir
  video.addEventListener('ended', () => eqPreview('Revoir la vidéo'));

  // En remontant tout en haut, la vidéo redevient un aperçu muet
  ScrollTrigger.create({
    trigger: eq,
    start: 'top top',
    onLeaveBack: () => {
      if (!video.muted) eqPreview();
    },
  });

  if (reduce) video.pause();
}

// ============ MEMBRES : la fiche du membre choisi dans la liste (au clic, plus de pin) ============
// Mêmes animations qu'avant : à l'entrée, la photo s'ouvre depuis le centre, le nom et le métier montent
// dans leur masque, la présentation et le bouton apparaissent en fondu ; à la sortie, l'inverse, plus vite.
function initEquipeMembers() {
  const em = document.querySelector<HTMLElement>('[data-anim="em-team"]');
  if (!em) return;
  const panels = new Map<string, HTMLElement>();
  em.querySelectorAll<HTMLElement>('[data-em-panel]').forEach((p) => panels.set(p.dataset.emPanel!, p));
  const picks = Array.from(em.querySelectorAll<HTMLButtonElement>('[data-em-pick]'));
  const first = panels.values().next().value as HTMLElement | undefined;
  if (!first || !picks.length) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const d = (s: number) => (reduce ? 0 : s);
  const q = (root: HTMLElement, sel: string) => root.querySelectorAll<HTMLElement>(sel);

  // Textes qui montent dans leur masque, fondus, médias ouverts depuis le centre
  const emHide = (root: HTMLElement) => {
    if (reduce) return;
    gsap.set(q(root, '[data-em-line] > span'), { yPercent: 110 });
    gsap.set(q(root, '[data-em-fade]'), { autoAlpha: 0, y: 24 });
    gsap.set(q(root, '[data-em-clip]'), { clipPath: CENTER });
  };
  const emIn = (root: HTMLElement) => gsap.timeline()
    // fromTo avec le départ explicite : le navigateur abrège « inset(50% 50% 50% 50%) » en « inset(50%) »,
    // que GSAP lisait comme « 50 % en haut seulement » (ouverture de bas en haut au lieu de depuis le centre)
    .fromTo(q(root, '[data-em-clip]'), { clipPath: CENTER }, { clipPath: FULL, duration: d(1.6), ease: CLIP_EASE, stagger: 0.12 }, 0)
    .to(q(root, '[data-em-line] > span'), { yPercent: 0, duration: d(1), ease: 'musesEase', stagger: 0.07 }, 0)
    .to(q(root, '[data-em-fade]'), { autoAlpha: 1, y: 0, duration: d(0.8), ease: 'musesEase', stagger: 0.06 }, d(0.2));
  const emOut = (root: HTMLElement) => gsap.timeline()
    .to(q(root, '[data-em-line] > span'), { yPercent: -110, duration: d(0.45), ease: 'power2.in', stagger: 0.03 }, 0)
    .to(q(root, '[data-em-fade]'), { autoAlpha: 0, duration: d(0.3) }, 0)
    .to(q(root, '[data-em-clip]'), { clipPath: CENTER, duration: d(0.45), ease: 'power2.in', stagger: 0.05 }, 0);

  let current = first.dataset.emPanel!;
  let running: gsap.core.Timeline | null = null;
  let entered = false;
  emHide(first);

  const setActive = (key: string) => picks.forEach((b) => {
    const on = b.dataset.emPick === key;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });

  const emShow = (next: string) => {
    const to = panels.get(next);
    if (!to || next === current) return;
    const from = panels.get(current)!;
    current = next;
    setActive(next);
    // Membre du bien-être : la section passe sur fond vert, textes en crème
    em.classList.toggle('is-green', to.hasAttribute('data-em-green'));
    if (running) running.progress(1);
    // Fiche pas encore entrée (clic avant l'arrivée de la section) : on échange directement
    if (!entered) {
      entered = true;
      from.hidden = true;
      to.hidden = false;
      emHide(to);
      running = emIn(to);
      return;
    }
    running = emOut(from).eventCallback('onComplete', () => {
      from.hidden = true;
      to.hidden = false;
      emHide(to);
      running = emIn(to);
    });
  };
  picks.forEach((b) => b.addEventListener('click', () => emShow(b.dataset.emPick!)));

  // Entrée de la première fiche à l'arrivée de la section
  ScrollTrigger.create({
    trigger: em,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      if (entered) return;
      entered = true;
      running = emIn(panels.get(current)!);
    },
  });
}
