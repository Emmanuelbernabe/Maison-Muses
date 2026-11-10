import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from 'gsap/Observer';
import { revealTitle } from './revealTitle';

gsap.registerPlugin(ScrollTrigger, Observer);

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

    // ── Un geste de scroll = une carte, avec un easing doux ──
    const s5Ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let s5Index = 0;
    let s5Active = false;
    let s5Busy = false;
    let s5Streak = false;
    let s5LastEvent = 0;
    let s5Observer: Observer | null = null;
    // Référence posée juste après la création du tween : ScrollTrigger peut appeler onEnter / onLeave
    // pendant sa création (page rechargée plus bas), avant que la constante existe
    let s5St: ScrollTrigger | null = null;
    const s5Cleanups: Array<() => void> = [];

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
        // Sans Lenis : simple aimantation sur la carte suivante
        snap: lenis ? undefined : { snapTo: 1 / s5Last, directional: true, duration: { min: 0.6, max: 1.2 }, ease: 'power2.inOut' },
        onEnter: (self) => s5Capture(Math.round(self.progress * s5Last)),
        onEnterBack: (self) => s5Capture(Math.round(self.progress * s5Last)),
        onLeave: () => s5Free(),
        onLeaveBack: () => s5Free(),
      },
    });

    function s5StepY(i: number) {
      const st = s5St!;
      const y = st.start + (st.end - st.start) * (i / s5Last);
      return Math.min(Math.max(y, st.start + 1), st.end - 1);   // reste à l'intérieur du pin
    }

    let s5BusyTimer = 0;
    function s5ScrollTo(y: number, duration: number) {
      s5Streak = true;
      if (Math.abs(y - window.scrollY) < 1) return;   // déjà en place
      s5Busy = true;
      clearTimeout(s5BusyTimer);
      const s5Done = () => { s5Busy = false; clearTimeout(s5BusyTimer); };
      s5BusyTimer = window.setTimeout(s5Done, duration * 1000 + 150);   // filet de sécurité
      lenis.scrollTo(y, {
        duration,
        easing: s5Ease,
        lock: true,
        force: true,
        onComplete: s5Done,
      });
    }

    function s5Goto(i: number, duration = 1.2) {
      s5Index = i;
      s5ScrollTo(s5StepY(i), duration);
    }

    // Entrée dans les coffrets : Lenis ignore la molette, c'est l'Observer qui décide du déplacement
    // Vrai seulement si le scroll est réellement dans la zone des coffrets
    // (un saut par-dessus la section déclenche onEnter sans qu'on y soit)
    function s5IsInside() {
      const st = s5St;
      if (!st) return false;
      const y = window.scrollY;
      return y > st.start && y < st.end;
    }

    function s5Capture(i: number) {
      if (!lenis || s5Active || !s5IsInside()) return;
      s5Active = true;
      s5Observer?.enable();
      s5Goto(i, 0.6);
    }

    function s5Free() {
      if (!s5Active) return;
      s5Active = false;
      s5Observer?.disable();
    }

    // Sortie par le haut ou par le bas : on rend la main au scroll normal
    function s5Release(dir: number) {
      const st = s5St!;
      s5Free();
      s5ScrollTo(dir > 0 ? st.end + 2 : st.start - 2, 0.5);
    }

    s5St = horizontalTween.scrollTrigger!;

    if (lenis) {
      lenis.options.virtualScroll = () => !s5Active;

      s5Observer = Observer.create({
        target: window,
        type: 'wheel,touch',
        tolerance: 8,
        preventDefault: true,
        onChange: (self) => {
          const now = performance.now();
          const gap = now - s5LastEvent;
          s5LastEvent = now;
          if (!s5Active || s5Busy) return;
          if (s5Streak && gap < 140) return;   // même élan que le geste précédent : ignoré
          s5Streak = false;
          const isTouch = (self.event as Event).type.includes('touch');
          const dir = (isTouch ? -self.deltaY : self.deltaY) > 0 ? 1 : -1;
          const next = s5Index + dir;
          if (next < 0) s5Release(-1);
          else if (next > s5Last) s5Release(1);
          else s5Goto(next);
        },
      });
      s5Observer.disable();
      if (horizontalTween.scrollTrigger!.isActive) s5Capture(Math.round(horizontalTween.scrollTrigger!.progress * s5Last));

      // Après chaque recalcul (resize, console) : on se recale pile sur la carte en cours
      const s5AfterRefresh = () => {
        if (s5IsInside()) {
          if (!s5Active) s5Index = Math.round(s5St!.progress * s5Last);
          s5Active = true;
          s5Busy = false;
          s5Observer?.enable();
          lenis.scrollTo(s5StepY(s5Index), { immediate: true, force: true });
        } else {
          s5Free();
        }
      };
      ScrollTrigger.addEventListener('refresh', s5AfterRefresh);
      s5Cleanups.push(() => ScrollTrigger.removeEventListener('refresh', s5AfterRefresh));
    }

    // ── Déclenchement du clip-path INDÉPENDANT sur chaque image ──
    const allImages = s5.querySelectorAll<HTMLElement>('[data-anim="s5-img"]');

    allImages.forEach((img) => {
      const card = img.closest<HTMLElement>('.s5-card');
      const isCard1 = card?.classList.contains('s5-card-1');

      if (isCard1) {
        // Pour chaque image de la Card 1 (déjà présente dans le viewport) :
        // Déclencheur vertical indépendant quand l'image arrive dans la vue
        ScrollTrigger.create({
          trigger: img,
          start: 'top 95%',
          onEnter: () => {
            gsap.to(img, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.9,
              ease: 'power3.out',
            });
          },
          onLeaveBack: () => {
            gsap.to(img, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: 0.7,
              ease: 'power3.in',
            });
          },
        });
      } else {
        // Pour CHAQUE image des cartes suivantes :
        // Déclencheur horizontal 100% indépendant lié au défilement horizontal !
        ScrollTrigger.create({
          trigger: img,
          containerAnimation: horizontalTween,
          start: 'left 92%',
          onEnter: () => {
            gsap.to(img, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.9,
              ease: 'power3.out',
            });
          },
          onLeaveBack: () => {
            gsap.to(img, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: 0.7,
              ease: 'power3.in',
            });
          },
        });
      }
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

    // ── Titres qui glissent à l'arrivée de chaque carte (la première est déjà à l'écran) ──
    s5.querySelectorAll<HTMLElement>('[data-anim="s5-title"]').forEach((title, i) => {
      if (i === 0) return;
      gsap.from(title, {
        x: 120,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          containerAnimation: horizontalTween,
          start: 'left 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    window.addEventListener('resize', updateCardWidth);

    return () => {
      window.removeEventListener('resize', updateCardWidth);
      s5Observer?.kill();
      s5Cleanups.forEach((fn) => fn());
      s5Active = false;
      if (lenis) lenis.options.virtualScroll = undefined;
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