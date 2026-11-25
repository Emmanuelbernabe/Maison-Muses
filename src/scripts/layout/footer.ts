import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { revealTitle } from '../shared/revealTitle';

const S9_ORANGE = '#e57851';
const S9_CREAM = '#F7F2EC';

// Styles de carte à la couleur du footer (orange par défaut, vert sur la page bien-être)
function footerMix(hex: string, into: string, amount: number) {
  const a = hex.replace('#', '').match(/../g)!.map((x) => parseInt(x, 16));
  const b = into.replace('#', '').match(/../g)!.map((x) => parseInt(x, 16));
  return '#' + a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, '0')).join('');
}

function footerMapStyles(color: string) {
  const footerWater = footerMix(color, S9_CREAM, 0.18);
  return [
    { elementType: 'geometry', stylers: [{ color: S9_CREAM }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: S9_CREAM }, { weight: 3 }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ weight: 1.6 }] },
    { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ weight: 1.1 }] },
    { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ weight: 0.6 }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: footerWater }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color }] },
  ];
}

const footerPinSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${color}"/><circle cx="20" cy="20" r="5" fill="${S9_CREAM}"/></svg>`;

// ============ GOOGLE MAPS ============
function footerLoadGoogleMaps(key: string): Promise<any> {
  const w = window as any;
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google.maps);

  return new Promise((resolve, reject) => {
    w.__footerMapsReady = () => resolve(w.google.maps);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__footerMapsReady`;
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function footerInitMaps(canvases: HTMLElement[], color: string) {
  const key = canvases[0].dataset.key;
  if (!key) return;

  const maps = await footerLoadGoogleMaps(key);
  const { Map } = await maps.importLibrary('maps');
  const { Marker } = await maps.importLibrary('marker');
  const { Geocoder } = await maps.importLibrary('geocoding');
  const footerGeocoder = new Geocoder();

  canvases.forEach((canvas) => {
    footerGeocoder.geocode({ address: canvas.dataset.address }, (results: any[], status: string) => {
      if (status !== 'OK' || !results?.[0]) return;
      const footerPosition = results[0].geometry.location;

      const footerMap = new Map(canvas, {
        center: footerPosition,
        zoom: 15,
        styles: footerMapStyles(color),
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
        clickableIcons: false,
        backgroundColor: S9_CREAM,
      });

      new Marker({
        map: footerMap,
        position: footerPosition,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(footerPinSvg(color)),
          scaledSize: new maps.Size(40, 40),
          anchor: new maps.Point(20, 20),
        },
      });
    });
  });
}

export function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  revealTitle(footer.querySelector<HTMLElement>('[data-anim="footer-title"]'));

  // ── Cartes : chargées seulement à l'approche du footer ──
  const footerCanvases = Array.from(footer.querySelectorAll<HTMLElement>('[data-anim="footer-map"]'));

  if (footerCanvases.length) {
    const footerMapObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      footerMapObserver.disconnect();
      // Couleur lue sur le footer (variable --footer-c) : orange, ou vert sur la page bien-être
      const footerColor = getComputedStyle(footer).getPropertyValue('--footer-c').trim() || S9_ORANGE;
      footerInitMaps(footerCanvases, /^#[0-9a-f]{6}$/i.test(footerColor) ? footerColor : S9_ORANGE).catch(() => {});
    }, { rootMargin: '600px 0px' });

    footerCanvases.forEach((canvas) => footerMapObserver.observe(canvas));
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── MAISON : lettres qui montent au scroll ──
  const footerBrand = footer.querySelector<HTMLElement>('[data-anim="footer-brand"]');
  const footerBrandMain = footer.querySelector<HTMLElement>('[data-anim="footer-brand-main"]');
  if (!footerBrand || !footerBrandMain) return;

  SplitText.create(footerBrandMain, {
    type: 'chars',
    mask: 'chars',
    autoSplit: true,
    onSplit(self) {
      gsap.set(self.masks, { paddingBlock: '0.1em', marginBlock: '-0.1em' });
      return gsap.from(self.chars, {
        yPercent: 120,
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: {
          trigger: footerBrand,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    },
  });
}