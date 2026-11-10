import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create('musesEase', '0.22,1,0.36,1');

/* ───────── Apparition commune des titres (celle de s5-intro-main) ─────────
   Ligne par ligne dans un masque, rejouée quand on remonte au-dessus du titre puis qu'on redescend */
export function revealTitle(title: HTMLElement | null) {
  if (!title) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(title, { autoAlpha: 1 });
    return;
  }

  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      gsap.set(self.masks, { paddingBlock: '0.12em', marginBlock: '-0.12em' });
      gsap.set(title, { autoAlpha: 1 });
      return gsap.from(self.lines, {
        yPercent: 130,
        duration: 1.2,
        ease: 'musesEase',
        stagger: 0.12,
        scrollTrigger: { trigger: title, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    },
  });
}