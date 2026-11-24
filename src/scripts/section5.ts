import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { revealTitle } from './revealTitle';

gsap.registerPlugin(ScrollTrigger);

export function initSection5() {
  const s5 = document.getElementById('s5');
  const pinWrap = s5?.querySelector<HTMLElement>('[data-anim="s5-pin"]');
  const track = s5?.querySelector<HTMLElement>('[data-anim="s5-track"]');
  if (!s5 || !pinWrap || !track) return;

  // ── Vidéo Prestige : chargée et lue seulement à l'approche de la carte 4, en pause sinon ──
  const s5Video = s5.querySelector<HTMLVideoElement>('[data-anim="s5-video"]');
  if (s5Video) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) s5Video.play().catch(() => {});
      else s5Video.pause();
    }, { rootMargin: '50% 100% 50% 100%' }).observe(s5Video);
  }

  // ── Photos des coffrets chargées et décodées AVANT d'arriver dans la section ──
  // En « lazy », chaque grande photo se téléchargeait et se décodait pendant le défilement horizontal :
  // à-coups (images sautées) et cadres vides qui se remplissent d'un coup. On les prépare 2 écrans avant.
  const s5Imgs = Array.from(s5.querySelectorAll<HTMLImageElement>('.s5-track img'));
  const s5Preload = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    s5Preload.disconnect();
    s5Imgs.forEach((img) => {
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
  }, { rootMargin: '200% 0px 200% 0px' });
  s5Preload.observe(s5);

  // ── Titre d'intro : apparition ligne par ligne (référence pour tous les titres du site) ──
  revealTitle(s5.querySelector<HTMLElement>('.s5-intro-main'));

  const mm = gsap.matchMedia();

  // Desktop (min-width: 1024px)
  mm.add('(min-width: 1024px)', () => {
    const updateCardWidth = () => {
      const w = pinWrap.clientWidth || window.innerWidth;
      s5.style.setProperty('--s5-card-w', `${w}px`);
    };

    updateCardWidth();

    const scrollAmount = () => track.scrollWidth - pinWrap.clientWidth;

    const lenis = (window as any).__lenis as any;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.s5-card'));
    const s5Last = cards.length - 1;
    const s5Cleanups: Array<() => void> = [];

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
        snap: lenis ? undefined : { snapTo: 1 / s5Last, directional: true, delay: 0.1, duration: { min: 0.4, max: 0.9 }, ease: 'power2.inOut' },
      },
    });
    const s5St = horizontalTween.scrollTrigger!;

    if (lenis) {
      // ── Une carte par geste, sans verrou ──
      // Dans la section, la molette ne fait plus défiler la page : chaque nouveau geste avance d'une carte.
      // Un geste pendant l'animation repart aussitôt vers la carte suivante (rien n'est ignoré ni bloqué),
      // une molette tournée vite enchaîne les cartes, et l'élan d'un trackpad compte pour un seul geste.
      // Même courbe que le reste du site : cubic-bezier(0.22, 1, 0.36, 1) (« musesEase », déclarée dans revealTitle.ts)
      const s5Ease = gsap.parseEase('musesEase') as (t: number) => number;
      let s5Index = 0;
      let s5Active = false;       // la molette pilote les cartes
      let s5Leaving = false;      // sortie en cours : pas de recapture tant qu'on n'a pas quitté la zone
      let s5Dir = 1;
      let s5LastEvent = 0;
      let s5LastStep = 0;
      let s5PrevDelta = 0;
      let s5PrevDir = 0;

      const s5StepY = (i: number) => {
        const y = s5St.start + (s5St.end - s5St.start) * (i / s5Last);
        return Math.min(Math.max(y, s5St.start + 1), s5St.end - 1);   // reste à l'intérieur du pin
      };
      const s5Inside = (y: number) => y > s5St.start && y < s5St.end;
      const s5Go = (y: number, duration: number) =>
        lenis.scrollTo(y, { duration, easing: s5Ease, force: true });   // pas de « lock »

      const s5Capture = (y: number) => {
        const p = ((y - s5St.start) / (s5St.end - s5St.start)) * s5Last;
        s5Index = Math.min(s5Last, Math.max(0, s5Dir > 0 ? Math.floor(p) : Math.ceil(p)));
        s5Active = true;
        s5LastStep = performance.now();   // l'élan qui nous a fait entrer ne saute pas la 1re carte
        s5Go(s5StepY(s5Index), 1.1);
      };

      const s5Step = (dir: number) => {
        s5LastStep = performance.now();
        const next = s5Index + dir;
        if (next < 0 || next > s5Last) {
          // Au bord : on sort de la section, le reste du geste fait défiler la page normalement
          s5Active = false;
          s5Leaving = true;
          s5Go(dir > 0 ? s5St.end + 2 : s5St.start - 2, 0.8);
          return;
        }
        s5Index = next;
        s5Go(s5StepY(next), 1.6);
      };

      const s5OnWheel = (e: WheelEvent) => {
        if (!s5Active) return;
        e.preventDefault();               // la page ne défile pas : c'est la carte qui bouge
        const now = performance.now();
        const gap = now - s5LastEvent;
        s5LastEvent = now;
        const d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 40 : 1);
        if (d < 1) return;
        const dir = e.deltaY > 0 ? 1 : -1;
        // Nouveau geste : pause dans le flux, changement de sens, ou impulsion plus forte que la précédente (l'élan, lui, décroît)
        const fresh = gap > 160 || dir !== s5PrevDir || d > s5PrevDelta * 1.4 + 4;
        // Molette tournée en continu : une carte de plus toutes les 600 ms
        const spinning = now - s5LastStep > 600 && d >= 50;
        s5PrevDelta = d;
        s5PrevDir = dir;
        if (fresh || spinning) s5Step(dir);
      };

      const s5OnScroll = (l: any) => {
        if (l.direction) s5Dir = l.direction;
        const y = l.scroll;
        if (s5Leaving) {
          if (!s5Inside(y)) s5Leaving = false;
          return;
        }
        if (!s5Active && s5Inside(y)) s5Capture(y);          // entrée dans la section
        else if (s5Active && (y < s5St.start - 4 || y > s5St.end + 4)) s5Active = false;   // sortie par la barre de défilement, une ancre…
      };

      // Dans la section, Lenis laisse la molette aux cartes
      lenis.options.virtualScroll = () => !s5Active;
      lenis.on('scroll', s5OnScroll);
      window.addEventListener('wheel', s5OnWheel, { passive: false });

      // Après chaque recalcul (resize…) : on se recale pile sur la carte en cours
      const s5AfterRefresh = () => {
        if (s5Active) lenis.scrollTo(s5StepY(s5Index), { immediate: true, force: true });
      };
      ScrollTrigger.addEventListener('refresh', s5AfterRefresh);

      // Page rechargée au milieu des coffrets
      if (s5Inside(lenis.scroll)) s5Capture(lenis.scroll);

      s5Cleanups.push(() => {
        lenis.off?.('scroll', s5OnScroll);
        window.removeEventListener('wheel', s5OnWheel);
        ScrollTrigger.removeEventListener('refresh', s5AfterRefresh);
        lenis.options.virtualScroll = undefined;
      });
    }

    // ── Arrivée de la carte 1 à l'écran : le haut de la section passe aux 40 % de la hauteur ──
    // Calculé depuis le début du défilement horizontal (s5St.start), toujours juste, même après un rechargement
    // sous la section (un repère dans le bloc épinglé, lui, était mesuré décalé)
    const s5Card1In = { trigger: s5, start: () => s5St.start - innerHeight * 0.4 };

    // ── Déclenchement du clip-path INDÉPENDANT sur chaque image ──
    // Visible dès qu'on a dépassé le point de départ, quel que soit le sens d'arrivée (par le haut, ou en
    // remontant depuis le bas) ; cachée seulement quand on repasse au-dessus, pour rejouer l'entrée.
    // Page rechargée plus bas que ce point : l'image est affichée tout de suite (sans quoi elle restait vide).
    const allImages = s5.querySelectorAll<HTMLElement>('[data-anim="s5-img"]');
    const s5Clip = (img: HTMLElement, show: boolean, delay = 0) =>
      gsap.to(img, {
        clipPath: show ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        duration: show ? 0.9 : 0.7,
        delay: show ? delay : 0,
        ease: show ? 'power3.out' : 'power3.in',
        overwrite: true,
      });

    let s5Card1Rank = 0;
    allImages.forEach((img) => {
      const card = img.closest<HTMLElement>('.s5-card');
      const isCard1 = card?.classList.contains('s5-card-1');
      // Carte 1 : ses images se dévoilent l'une après l'autre, comme sur les cartes suivantes
      const delay = isCard1 ? 0.15 * s5Card1Rank++ : 0;

      const st = ScrollTrigger.create({
        // Carte 1 : quand la carte arrive à l'écran (même moment que son titre) ;
        // cartes suivantes : liées au défilement horizontal
        ...(isCard1 ? s5Card1In : { trigger: img, containerAnimation: horizontalTween, start: 'left 92%' }),
        onEnter: () => s5Clip(img, true, delay),
        onEnterBack: () => s5Clip(img, true, delay),
        onLeaveBack: () => s5Clip(img, false),
      });
      if (st.scroll() > st.start) gsap.set(img, { clipPath: 'inset(0% 0% 0% 0%)' });
    });

    // ── Parallaxe dans les grandes images (et la vidéo) pendant le défilement ──
    s5.querySelectorAll<HTMLElement>('[data-anim="s5-parallax"]').forEach((layer) => {
      gsap.fromTo(layer, { xPercent: 8 }, {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('.s5-img-big'),
          containerAnimation: horizontalTween,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      });
    });

    // ── Titres qui glissent de droite à gauche à l'arrivée de chaque carte ──
    // Cartes 2 à 4 : liées au défilement horizontal. Carte 1 : quand elle arrive à l'écran (s5Card1In).
    // Départ posé avec gsap.set (et non gsap.from) : fiable aussi quand la page se recharge déjà défilée.
    s5.querySelectorAll<HTMLElement>('[data-anim="s5-title"]').forEach((title, i) => {
      gsap.set(title, { x: 120, opacity: 0 });
      gsap.to(title, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: i === 0
          ? { ...s5Card1In, toggleActions: 'play none none reverse' }
          : { trigger: title, containerAnimation: horizontalTween, start: 'left 85%', toggleActions: 'play none none reverse' },
      });
    });

    window.addEventListener('resize', updateCardWidth);

    return () => {
      window.removeEventListener('resize', updateCardWidth);
      s5Cleanups.forEach((fn) => fn());
    };
  });

  // Mobile (< 1024px)
  mm.add('(max-width: 1023px)', () => {
    const images = s5.querySelectorAll<HTMLElement>('[data-anim="s5-img"]');
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
