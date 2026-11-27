import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create('musesEase', '0.22,1,0.36,1');
// Révélations d'images (clip-path) : départ franc, puis une longue décélération pour qu'on voie l'image se dévoiler
// Sur 1,6 s : ~27 % dévoilé à 0,2 s, ~60 % à 0,4 s, ~80 % à 0,6 s, puis la fin se pose lentement
CustomEase.create('musesReveal', '0.3,0.55,0.2,1');

/* ───────── Apparition commune des titres (celle de coffrets-intro-main) ─────────
   Ligne par ligne dans un masque, rejouée quand on remonte au-dessus du titre puis qu'on redescend */
export function revealTitle(title: HTMLElement | null) {
  if (!title) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(title, { autoAlpha: 1 });
    return;
  }

  const split = SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    // Les lignes contiennent déjà le texte : pas d'aria-label (interdit sur un <p>, signalé par les outils d'accessibilité)
    aria: 'none',
    onSplit(self) {
      gsap.set(self.masks, { paddingBlock: '0.12em', marginBlock: '-0.12em' });
      // Position de départ posée explicitement (lignes cachées sous leur masque) : avec un gsap.from(),
      // elle n'était pas appliquée quand la page se recharge déjà défilée, et les lignes restaient visibles
      // jusqu'au déclenchement, puis sautaient en bas avant de remonter (le « flick »)
      gsap.set(self.lines, { yPercent: 130 });
      gsap.set(title, { autoAlpha: 1 });
      return gsap.to(self.lines, {
        yPercent: 0,
        duration: 1.2,
        ease: 'musesEase',
        stagger: 0.12,
        scrollTrigger: { trigger: title, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    },
  });
  revealSplits.add(split);
  revealWatchResize();
}

/* ───────── Redécoupage quand la largeur de la fenêtre change ─────────
   autoSplit ne redécoupe que si la largeur du TITRE change. Or plusieurs titres sont dans des boîtes ajustées
   à leur contenu : une fois découpés en lignes étroites (fenêtre réduite), leur largeur ne bouge plus et les
   lignes restaient étroites en ré-agrandissant (titre du footer : 2 lignes de trop). split() rétablit le texte
   puis le redécoupe à la largeur actuelle ; l'animation renvoyée par onSplit est reprise par SplitText. */
const revealSplits = new Set<SplitText>();
let revealWatching = false;
function revealWatchResize() {
  if (revealWatching) return;
  revealWatching = true;
  let lastW = innerWidth;
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (innerWidth === lastW) return;   // hauteur seule (barre d'adresse mobile) : rien à faire
      lastW = innerWidth;
      revealSplits.forEach((s) => s.split());
    }, 200);
  };
  addEventListener('resize', onResize);
  // Changement de page : les titres de l'ancienne page disparaissent
  document.addEventListener('astro:before-swap', () => {
    removeEventListener('resize', onResize);
    clearTimeout(timer);
    revealSplits.clear();
    revealWatching = false;
  }, { once: true });
}