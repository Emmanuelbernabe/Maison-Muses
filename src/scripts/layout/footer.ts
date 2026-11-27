import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { revealTitle } from '../shared/revealTitle';

export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  revealTitle(footer.querySelector<HTMLElement>('[data-anim="footer-title"]'));

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── MAISON : lettres qui montent au scroll, chacune avec un ralenti à l'arrivée ──
  const footerBrand = footer.querySelector<HTMLElement>('[data-anim="footer-brand"]');
  const footerBrandMain = footer.querySelector<HTMLElement>('[data-anim="footer-brand-main"]');
  if (!footerBrand || !footerBrandMain) return;

  SplitText.create(footerBrandMain, {
    type: 'chars',
    mask: 'chars',
    autoSplit: true,
    // Mot décoratif, masqué aux lecteurs d'écran (SiteFooter.astro) : pas d'aria-label (interdit sur un <p>)
    aria: 'none',
    onSplit(self) {
      // Haut du masque : marge pour les empattements. Bas du masque : juste sous la ligne de base
      // des lettres (la boîte de ligne descend 0,12em plus bas et chevauchait « MUSES »)
      gsap.set(self.masks, { paddingTop: '0.1em', marginTop: '-0.1em', clipPath: 'inset(0 0 0.09em 0)' });
      return gsap.from(self.chars, {
        yPercent: 120,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: footerBrand,
          start: 'top 95%',
          end: 'max',
          scrub: 1.2,
        },
      });
    },
  });
}