import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { revealTitle } from './revealTitle';

const S9_ORANGE = '#e57851';
const S9_CREAM = '#F7F2EC';

// Styles de carte à la couleur du footer (orange par défaut, vert sur la page bien-être)
function s9Mix(hex: string, into: string, amount: number) {
  const a = hex.replace('#', '').match(/../g)!.map((x) => parseInt(x, 16));
  const b = into.replace('#', '').match(/../g)!.map((x) => parseInt(x, 16));
  return '#' + a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, '0')).join('');
}

function s9MapStyles(color: string) {
  const s9Water = s9Mix(color, S9_CREAM, 0.18);
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
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: s9Water }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color }] },
  ];
}

const s9PinSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${color}"/><circle cx="20" cy="20" r="5" fill="${S9_CREAM}"/></svg>`;

// ============ GOOGLE MAPS ============
function s9LoadGoogleMaps(key: string): Promise<any> {
  const w = window as any;
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google.maps);

  return new Promise((resolve, reject) => {
    w.__s9MapsReady = () => resolve(w.google.maps);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__s9MapsReady`;
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function s9InitMaps(canvases: HTMLElement[], color: string) {
  const key = canvases[0].dataset.key;
  if (!key) return;

  const maps = await s9LoadGoogleMaps(key);
  const { Map } = await maps.importLibrary('maps');
  const { Marker } = await maps.importLibrary('marker');
  const { Geocoder } = await maps.importLibrary('geocoding');
  const s9Geocoder = new Geocoder();

  canvases.forEach((canvas) => {
    s9Geocoder.geocode({ address: canvas.dataset.address }, (results: any[], status: string) => {
      if (status !== 'OK' || !results?.[0]) return;
      const s9Position = results[0].geometry.location;

      const s9Map = new Map(canvas, {
        center: s9Position,
        zoom: 15,
        styles: s9MapStyles(color),
        disableDefaultUI: true,
        gestureHandling: 'cooperative',
        clickableIcons: false,
        backgroundColor: S9_CREAM,
      });

      new Marker({
        map: s9Map,
        position: s9Position,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(s9PinSvg(color)),
          scaledSize: new maps.Size(40, 40),
          anchor: new maps.Point(20, 20),
        },
      });
    });
  });
}

export function initSection9() {
  const s9 = document.getElementById('s9');
  if (!s9) return;

  revealTitle(s9.querySelector<HTMLElement>('[data-anim="s9-title"]'));

  // ── Cartes : chargées seulement à l'approche du footer ──
  const s9Canvases = Array.from(s9.querySelectorAll<HTMLElement>('[data-anim="s9-map"]'));

  if (s9Canvases.length) {
    const s9MapObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      s9MapObserver.disconnect();
      // Couleur lue sur le footer (variable --s9-c) : orange, ou vert sur la page bien-être
      const s9Color = getComputedStyle(s9).getPropertyValue('--s9-c').trim() || S9_ORANGE;
      s9InitMaps(s9Canvases, /^#[0-9a-f]{6}$/i.test(s9Color) ? s9Color : S9_ORANGE).catch(() => {});
    }, { rootMargin: '600px 0px' });

    s9Canvases.forEach((canvas) => s9MapObserver.observe(canvas));
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── MAISON : lettres qui montent au scroll ──
  const s9Brand = s9.querySelector<HTMLElement>('[data-anim="s9-brand"]');
  const s9BrandMain = s9.querySelector<HTMLElement>('[data-anim="s9-brand-main"]');
  if (!s9Brand || !s9BrandMain) return;

  SplitText.create(s9BrandMain, {
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
          trigger: s9Brand,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    },
  });
}