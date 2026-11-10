import { gsap } from 'gsap';
import { revealTitle } from './revealTitle';

export function initSection7() {
  const s7 = document.getElementById('s7');
  if (!s7) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s7Doors = Array.from(s7.querySelectorAll<HTMLElement>('[data-anim="s7-door"]'));

  revealTitle(s7.querySelector<HTMLElement>('[data-anim="s7-title"]'));

  // ── Apparition des portes ──
  if (!reduce && s7Doors.length) {
    gsap.fromTo(
      s7Doors,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'musesEase',
        stagger: 0.12,
        scrollTrigger: { trigger: s7.querySelector('[data-anim="s7-doors"]'), start: 'top 85%', once: true },
      }
    );
  }

  // ── Desktop : la porte survolée s'ouvre (largeur GSAP, voile et bandeau en CSS via .is-open) ──
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const s7OpenDoor = (door: HTMLElement) => {
      s7Doors.forEach((other) => {
        const s7IsOpen = other === door;
        other.classList.toggle('is-open', s7IsOpen);
        gsap.to(other, {
          flexGrow: s7IsOpen ? 2.4 : 1,
          duration: reduce ? 0 : 1,
          ease: 'musesEase',
          overwrite: 'auto',
        });
      });
    };

    const s7Handlers = s7Doors.map((door) => {
      const s7OnEnter = () => s7OpenDoor(door);
      door.addEventListener('pointerenter', s7OnEnter);
      door.addEventListener('focus', s7OnEnter);
      return s7OnEnter;
    });

    return () => {
      s7Doors.forEach((door, i) => {
        door.removeEventListener('pointerenter', s7Handlers[i]);
        door.removeEventListener('focus', s7Handlers[i]);
      });
      gsap.set(s7Doors, { clearProps: 'flexGrow' });
    };
  });
}