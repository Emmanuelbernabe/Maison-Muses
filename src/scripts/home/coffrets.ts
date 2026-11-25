import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { revealTitle } from '../shared/revealTitle';

gsap.registerPlugin(ScrollTrigger);

export function initHomeCoffrets() {
  const coffrets = document.getElementById('coffrets');
  const pinWrap = coffrets?.querySelector<HTMLElement>('[data-anim="coffrets-pin"]');
  const track = coffrets?.querySelector<HTMLElement>('[data-anim="coffrets-track"]');
  if (!coffrets || !pinWrap || !track) return;

  // ── Vidéo Prestige : chargée et lue seulement à l'approche de la carte 4, en pause sinon ──
  const coffretsVideo = coffrets.querySelector<HTMLVideoElement>('[data-anim="coffrets-video"]');
  if (coffretsVideo) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) coffretsVideo.play().catch(() => {});
      else coffretsVideo.pause();
    }, { rootMargin: '50% 100% 50% 100%' }).observe(coffretsVideo);
  }

  // ── Photos des coffrets chargées et décodées AVANT d'arriver dans la section ──
  // En « lazy », chaque grande photo se téléchargeait et se décodait pendant le défilement horizontal :
  // à-coups (images sautées) et cadres vides qui se remplissent d'un coup. On les prépare 2 écrans avant.
  const coffretsImgs = Array.from(coffrets.querySelectorAll<HTMLImageElement>('.coffrets-track img'));
  const coffretsPreload = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    coffretsPreload.disconnect();
    coffretsImgs.forEach((img) => {
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
  }, { rootMargin: '200% 0px 200% 0px' });
  coffretsPreload.observe(coffrets);

  // ── Titre d'intro : apparition ligne par ligne (référence pour tous les titres du site) ──
  revealTitle(coffrets.querySelector<HTMLElement>('.coffrets-intro-main'));

  const mm = gsap.matchMedia();

  // Desktop (min-width: 1024px)
  mm.add('(min-width: 1024px)', () => {
    const updateCardWidth = () => {
      const w = pinWrap.clientWidth || window.innerWidth;
      coffrets.style.setProperty('--coffrets-card-w', `${w}px`);
    };

    updateCardWidth();

    const scrollAmount = () => track.scrollWidth - pinWrap.clientWidth;

    const lenis = (window as any).__lenis as any;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.coffrets-card'));
    const coffretsLast = cards.length - 1;
    const coffretsCleanups: Array<() => void> = [];

    // ── Défilement horizontal lié au scroll (scrub) ; le pas « une carte par geste » est géré plus bas ──
    const horizontalTween = gsap.to(track, {
      x: () => -scrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinWrap,
        start: 'top top',
        end: () => `+=${scrollAmount()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: updateCardWidth,
        // Sans Lenis (écran tactile) : aimantation native de ScrollTrigger
        snap: lenis ? undefined : { snapTo: 1 / coffretsLast, directional: true, delay: 0.1, duration: { min: 0.4, max: 0.9 }, ease: 'power2.inOut' },
      },
    });
    const coffretsSt = horizontalTween.scrollTrigger!;

    if (lenis) {
      // ── Une carte par geste, sans verrou ──
      // Dans la section, la molette ne fait plus défiler la page : chaque nouveau geste avance d'une carte.
      // Un geste pendant l'animation repart aussitôt vers la carte suivante (rien n'est ignoré ni bloqué),
      // une molette tournée vite enchaîne les cartes, et l'élan d'un trackpad compte pour un seul geste.
      // Même courbe que le reste du site : cubic-bezier(0.22, 1, 0.36, 1) (« musesEase », déclarée dans shared/revealTitle.ts)
      const coffretsEase = gsap.parseEase('musesEase') as (t: number) => number;
      let coffretsIndex = 0;
      let coffretsActive = false;       // la molette pilote les cartes
      let coffretsLeaving = false;      // sortie en cours : pas de recapture tant qu'on n'a pas quitté la zone
      let coffretsDir = 1;
      let coffretsLastEvent = 0;
      let coffretsLastStep = 0;
      let coffretsPrevDelta = 0;
      let coffretsPrevDir = 0;

      const coffretsStepY = (i: number) => {
        const y = coffretsSt.start + (coffretsSt.end - coffretsSt.start) * (i / coffretsLast);
        return Math.min(Math.max(y, coffretsSt.start + 1), coffretsSt.end - 1);   // reste à l'intérieur du pin
      };
      const coffretsInside = (y: number) => y > coffretsSt.start && y < coffretsSt.end;
      const coffretsGo = (y: number, duration: number) =>
        lenis.scrollTo(y, { duration, easing: coffretsEase, force: true });   // pas de « lock »

      const coffretsCapture = (y: number) => {
        const p = ((y - coffretsSt.start) / (coffretsSt.end - coffretsSt.start)) * coffretsLast;
        coffretsIndex = Math.min(coffretsLast, Math.max(0, coffretsDir > 0 ? Math.floor(p) : Math.ceil(p)));
        coffretsActive = true;
        coffretsLastStep = performance.now();   // l'élan qui nous a fait entrer ne saute pas la 1re carte
        coffretsGo(coffretsStepY(coffretsIndex), 1.1);
      };

      const coffretsStep = (dir: number) => {
        coffretsLastStep = performance.now();
        const next = coffretsIndex + dir;
        if (next < 0 || next > coffretsLast) {
          // Au bord : on sort de la section, le reste du geste fait défiler la page normalement
          coffretsActive = false;
          coffretsLeaving = true;
          coffretsGo(dir > 0 ? coffretsSt.end + 2 : coffretsSt.start - 2, 0.8);
          return;
        }
        coffretsIndex = next;
        coffretsGo(coffretsStepY(next), 1.6);
      };

      const coffretsOnWheel = (e: WheelEvent) => {
        if (!coffretsActive) return;
        e.preventDefault();               // la page ne défile pas : c'est la carte qui bouge
        const now = performance.now();
        const gap = now - coffretsLastEvent;
        coffretsLastEvent = now;
        const d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 40 : 1);
        if (d < 1) return;
        const dir = e.deltaY > 0 ? 1 : -1;
        // Nouveau geste : pause dans le flux, changement de sens, ou impulsion plus forte que la précédente (l'élan, lui, décroît)
        const fresh = gap > 160 || dir !== coffretsPrevDir || d > coffretsPrevDelta * 1.4 + 4;
        // Molette tournée en continu : une carte de plus toutes les 600 ms
        const spinning = now - coffretsLastStep > 600 && d >= 50;
        coffretsPrevDelta = d;
        coffretsPrevDir = dir;
        if (fresh || spinning) coffretsStep(dir);
      };

      const coffretsOnScroll = (l: any) => {
        if (l.direction) coffretsDir = l.direction;
        const y = l.scroll;
        if (coffretsLeaving) {
          if (!coffretsInside(y)) coffretsLeaving = false;
          return;
        }
        if (!coffretsActive && coffretsInside(y)) coffretsCapture(y);          // entrée dans la section
        else if (coffretsActive && (y < coffretsSt.start - 4 || y > coffretsSt.end + 4)) coffretsActive = false;   // sortie par la barre de défilement, une ancre…
      };

      // Dans la section, Lenis laisse la molette aux cartes
      lenis.options.virtualScroll = () => !coffretsActive;
      lenis.on('scroll', coffretsOnScroll);
      window.addEventListener('wheel', coffretsOnWheel, { passive: false });

      // Après chaque recalcul (resize…) : on se recale pile sur la carte en cours
      const coffretsAfterRefresh = () => {
        if (coffretsActive) lenis.scrollTo(coffretsStepY(coffretsIndex), { immediate: true, force: true });
      };
      ScrollTrigger.addEventListener('refresh', coffretsAfterRefresh);

      // Page rechargée au milieu des coffrets
      if (coffretsInside(lenis.scroll)) coffretsCapture(lenis.scroll);

      coffretsCleanups.push(() => {
        lenis.off?.('scroll', coffretsOnScroll);
        window.removeEventListener('wheel', coffretsOnWheel);
        ScrollTrigger.removeEventListener('refresh', coffretsAfterRefresh);
        lenis.options.virtualScroll = undefined;
      });
    }

    // ── Arrivée de la carte 1 à l'écran : le haut de la section passe aux 40 % de la hauteur ──
    // Calculé depuis le début du défilement horizontal (coffretsSt.start), toujours juste, même après un rechargement
    // sous la section (un repère dans le bloc épinglé, lui, était mesuré décalé)
    const coffretsCard1In = { trigger: coffrets, start: () => coffretsSt.start - innerHeight * 0.4 };

    // ── Déclenchement du clip-path INDÉPENDANT sur chaque image ──
    // Visible dès qu'on a dépassé le point de départ, quel que soit le sens d'arrivée (par le haut, ou en
    // remontant depuis le bas) ; cachée seulement quand on repasse au-dessus, pour rejouer l'entrée.
    // Page rechargée plus bas que ce point : l'image est affichée tout de suite (sans quoi elle restait vide).
    const allImages = coffrets.querySelectorAll<HTMLElement>('[data-anim="coffrets-img"]');
    const coffretsClip = (img: HTMLElement, show: boolean, delay = 0) =>
      gsap.to(img, {
        clipPath: show ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        duration: show ? 0.9 : 0.7,
        delay: show ? delay : 0,
        ease: show ? 'power3.out' : 'power3.in',
        overwrite: true,
      });

    let coffretsCard1Rank = 0;
    allImages.forEach((img) => {
      const card = img.closest<HTMLElement>('.coffrets-card');
      const isCard1 = card?.classList.contains('coffrets-card-1');
      // Carte 1 : ses images se dévoilent l'une après l'autre, comme sur les cartes suivantes
      const delay = isCard1 ? 0.15 * coffretsCard1Rank++ : 0;

      const st = ScrollTrigger.create({
        // Carte 1 : quand la carte arrive à l'écran (même moment que son titre) ;
        // cartes suivantes : liées au défilement horizontal
        ...(isCard1 ? coffretsCard1In : { trigger: img, containerAnimation: horizontalTween, start: 'left 92%' }),
        onEnter: () => coffretsClip(img, true, delay),
        onEnterBack: () => coffretsClip(img, true, delay),
        onLeaveBack: () => coffretsClip(img, false),
      });
      if (st.scroll() > st.start) gsap.set(img, { clipPath: 'inset(0% 0% 0% 0%)' });
    });

    // ── Parallaxe dans les grandes images (et la vidéo) pendant le défilement ──
    coffrets.querySelectorAll<HTMLElement>('[data-anim="coffrets-parallax"]').forEach((layer) => {
      gsap.fromTo(layer, { xPercent: 8 }, {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('.coffrets-img-big'),
          containerAnimation: horizontalTween,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      });
    });

    // ── Titres qui glissent de droite à gauche à l'arrivée de chaque carte ──
    // Cartes 2 à 4 : liées au défilement horizontal. Carte 1 : quand elle arrive à l'écran (coffretsCard1In).
    // Départ posé avec gsap.set (et non gsap.from) : fiable aussi quand la page se recharge déjà défilée.
    coffrets.querySelectorAll<HTMLElement>('[data-anim="coffrets-title"]').forEach((title, i) => {
      gsap.set(title, { x: 120, opacity: 0 });
      gsap.to(title, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: i === 0
          ? { ...coffretsCard1In, toggleActions: 'play none none reverse' }
          : { trigger: title, containerAnimation: horizontalTween, start: 'left 85%', toggleActions: 'play none none reverse' },
      });
    });

    window.addEventListener('resize', updateCardWidth);

    return () => {
      window.removeEventListener('resize', updateCardWidth);
      coffretsCleanups.forEach((fn) => fn());
    };
  });

  // Mobile (< 1024px)
  mm.add('(max-width: 1023px)', () => {
    const images = coffrets.querySelectorAll<HTMLElement>('[data-anim="coffrets-img"]');
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 85%',
          },
        }
      );
    });
  });
}
