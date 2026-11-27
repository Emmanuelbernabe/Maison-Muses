/* ───────── Contenu de référence du site ─────────
   Même structure et mêmes noms que les champs Sanity (studio/schemaTypes).
   - a servi à remplir Sanity (scripts/import-content.ts) ;
   - sert de secours si un champ est vidé dans le Studio (lib/content.ts).
   Aucune dépendance : lisible aussi bien par Astro que par le script d'import.
   Textes : **gras**, *italique*, retour à la ligne = saut de ligne (voir lib/rich.ts). */

/* Image : fichier local de secours (public/images) + texte alternatif par défaut */
export const img = (local: string | string[], alt = '') => ({ __img: [local].flat(), alt });
/* Vidéo : fichier local de secours (public/video) */
export const vid = (...local: string[]) => ({ __vid: local });
/* Lien : texte + adresse */
export const link = (label: string, url: string) => ({ label, url });


/* ══════════════════════ ACCUEIL ══════════════════════ */
export const HOME = {
  seoTitle: 'Maison Muses – Coiffure et bien-être à Toulouse',
  seoDescription: '',
  loader: {
    load1: img('load-1', 'Coiffure au salon Maison Muses'),
    load2: img('load-2', 'Coiffure au salon Maison Muses'),
    load3: img('load-3', 'Massage du visage à Maison Muses Bien-être'),
    load4: img('load-4', 'Coiffure au salon Maison Muses'),
  },
  hero: {
    heading: 'Maison Muses, coiffure et bien-être à Toulouse',
    subtitle: 'Sublimer vos cheveux, \néveiller vos sens.',
    video: vid('hero-bg-video'),
    portrait: img('hero', 'Cliente de Maison Muses, cheveux longs ondulés'),
    reveal: img('follow-1', 'Cliente de Maison Muses, balayage blond'),
    center: img('marquee-follow-img', 'Coiffeur Maison Muses en pleine coupe'),
  },
  intro: {
    title: 'L\'ART DE LA **COIFFURE**\nET DU **BIEN ÊTRE**\nSE **MELENT**',
    text: 'Notre équipe vous reçoit dans un environnement chaleureux et intimiste. Attentif à vos besoins, nous proposons systématiquement un diagnostic à toutes nos prestations. En cas de première visite, nous vous conseillons de réserver une consultation pour un diagnostique plus approfondi.',
    ctaBienEtre: link('ESPACE BIEN ÊTRE', '/bien-etre'),
    ctaCoiffure: link('ESPACE COIFFURE', '/coiffure'),
    image: img('ambiance-img', 'Ambiance Maison Muses'),
    video: vid('soin-bg-video'),
  },
  gallery: {
    images: [
      img(['marquee-1', 'slide-2'], ''),
      img(['marquee-3', 'slide-3'], ''),
      img(['marquee-4', 'slide-4'], ''),
      img(['marquee-5', 'slide-5'], ''),
      img(['marquee-6', 'slide-6'], ''),
    ],
  },
  team: {
    title: 'DES **PRESTATIONS HAUT DE GAMME**\nPOUR UNE **EXPÉRIENCE BIEN ÊTRE**\n**COMPLETE**',
    text: "NOTRE HISTOIRE, C'EST CELLE DE TROIS PASSIONNÉS QUI ONT RÉUNI LEUR SAVOIR-FAIRE POUR CRÉER BIEN PLUS QU'UN UNIVERS. ENSEMBLE, NOUS AVONS FAÇONNÉ MAISON MUSES, UN COCON OÙ L'ART DE LA COIFFURE ET DU BIEN-ÊTRE SE MÊLENT, DANS UNE QUÊTE COMMUNE D'EXCELLENCE ET D'ÉMOTION.",
    cta: link("VOIR L'ÉQUIPE", '/equipe'),
    thumb: img('team-thumb', 'Prestations soin'),
    left: img('team-left', 'Équipe Maison Muses'),
    mid: img('team-mid', 'Moussine et July'),
    right: img('team-right', 'Violaine'),
  },
  coffrets: {
    title: 'COIFFURE, MASSAGE, SOIN PROFOND. BIENVENUE DANS \nLE RITUEL DES *MUSES*.',
    text: "UNE JOURNÉE COIFFURE ET BIEN-ÊTRE DANS NOS 2 ÉTABLISSEMENTS AU CENTRE VILLE DE TOULOUSE. CES EXPÉRIENCES DÉDIÉES À NOS MUSES, VOUS APPORTE UN MOMENT DE DÉTENTE RIEN QUE POUR VOUS. UNE PAUSE OÙ NOTRE ÉQUIPE D'EXPERTS VOUS APPORTE DES SOINS HAUT DE GAMME.",
    prefix: 'COFFRET',
    items: [
      {
        name: 'INITIATION',
        tagline: 'LA PARENTHESE DOUCEUR',
        price: '80€',
        services: [
          { title: 'BIEN ÊTRE', detail: 'Massage relaxant\n30 min' },
          { title: 'COIFFURE', detail: 'Soin profond cheveux\n& coiffure au choix' },
        ],
        cta: link('RESERVER', 'https://www.planity.com/'),
        description: ["Profitez d'une parenthèse de douceur avec un massage relaxant de 30 minutes chez Maison Muses Bien-être, suivi d'un soin profond pour vos cheveux et d'une coiffure au choix. Idéal pour découvrir l'alliance du bien-être et de la coiffure."],
        bigImage: img(['initiation-big', 'soin-img'], 'Massage Maison Muses'),
        smallImage: img(['initiation-little', 'slide-2'], 'Coiffure Maison Muses'),
        bigVideo: null as any,
      },
      {
        name: 'HARMONIE',
        tagline: "L'EXPERIENCE SUR MESURE",
        price: 'SUR DEVIS',
        services: [
          { title: 'BIEN ÊTRE', detail: 'Prestation au choix' },
          { title: 'COIFFURE', detail: 'Prestation au choix' },
        ],
        cta: link('RESERVER', 'https://www.planity.com/'),
        description: ["L'harmonie parfaite entre beauté des cheveux et bien-être. Choisis librement parmi toutes nos prestations coiffure et soins pour un moment unique personnalisé (or rituels Olaplex/Tokio Inkarami et Essence des Muses). La durée sera en fonction des prestations choisies."],
        bigImage: img('harmonie-big', 'Soin Maison Muses'),
        smallImage: img('harmonie-little', 'Ambiance Maison Muses'),
        bigVideo: null as any,
      },
      {
        name: 'SYMBIOSE',
        tagline: "L'EXPERIENCE REVITALISANTE",
        price: '185 à 305€',
        services: [
          { title: 'BIEN ÊTRE', detail: 'Prestation au choix' },
          { title: 'COIFFURE', detail: 'Prestation au choix' },
        ],
        cta: link('RESERVER', 'https://www.planity.com/'),
        description: ["L'harmonie parfaite entre beauté des cheveux et bien-être. Choisis librement parmi toutes nos prestations coiffure et soins pour un moment unique personnalisé (or rituels Olaplex/Tokio Inkarami et Essence des Muses). La durée sera en fonction des prestations choisies."],
        bigImage: img('symbiose-big', 'Soin Symbiose'),
        smallImage: img('symbiose-little', 'Détail Symbiose'),
        bigVideo: null as any,
      },
      {
        name: 'PRESTIGE',
        tagline: 'LA SIGNATURE MAISON MUSES',
        price: '315 à 420€',
        services: [
          { title: 'BIEN ÊTRE', detail: 'Soin Signature\nEssence des Muses' },
          { title: 'COIFFURE', detail: 'Prestation au choix\navec le RITUEL TOKIO INKARAMI' },
        ],
        cta: link('RESERVER', 'https://www.planity.com/'),
        description: [
          "**L'ultime expérience signée Maison Muses Bien-être et Maison Muses coiffure !**",
          "Ce coffret regroupe la prestation coiffure de ton choix avec le rituel Tokio Inkarami, ainsi que le soin signature l'Essence des Muses qui est un voyage de deux heures alliant massage et soin visage.",
        ],
        bigImage: img('prestige-big', ''),
        smallImage: img('prestige-little', 'Coiffure Prestige'),
        bigVideo: vid('prestige-big'),
      },
    ],
  },
  reviews: {
    title: 'NOS MUSES **EN PARLENT MIEUX QUE NOUS.**',
    rating: 5,
    ratingLabel: 'SUR 435, AVIS VÉRIFIÉS PLANITY',
    cta: link('LIRE TOUS LES AVIS', 'https://www.planity.com/'),
    items: [
      { quote: 'Un diagnostic précis, un balayage exactement comme je l’imaginais. Je ne vais plus ailleurs.', author: 'Léa M.', service: 'Balayage' },
      { quote: 'Trente minutes de massage et j’ai oublié ma semaine. L’accueil est d’une douceur rare.', author: 'Camille D.', service: 'Massage relaxant' },
      { quote: 'Le coffret Initiation offert par mon copain : meilleure idée cadeau de l’année.', author: 'Sarah B.', service: 'Coffret Initiation' },
      { quote: 'On prend le temps de vous écouter. Mes cheveux n’ont jamais été aussi doux.', author: 'Inès T.', service: 'Soin profond' },
      { quote: 'Le salon est magnifique, l’équipe passionnée. Une vraie maison.', author: 'Julie P.', service: 'Coupe et couleur' },
    ],
  },
  routines: {
    title: 'UNE ROUTINE\n**PENSÉE POUR VOUS.**',
    text: 'QUELQUES QUESTIONS, ET NOS EXPERTS VOUS COMPOSENT UNE ROUTINE ADAPTÉE. VOUS LA RECEVEZ PAR E-MAIL.',
    prefix: 'ROUTINE',
    ctaLabel: 'FAIRE MON DIAGNOSTIC',
    doors: [
      {
        label: 'COIFFURE',
        text: 'VOS CHEVEUX, VOS HABITUDES, VOS ENVIES.',
        url: 'https://form.typeform.com/to/whoBdVpd',
        embedUrl: 'https://form.typeform.com/to/whoBdVpd?typeform-embed-id=5317714625339028&typeform-embed=embed-widget&typeform-source=maison-muses.fr&typeform-medium=snippet&typeform-medium-version=next&embed-opacity=100&typeform-embed-handles-redirect=1',
        image: img('marquee-1', 'Cheveux longs blonds ondulés au salon Maison Muses'),
      },
      {
        label: 'BIEN-ÊTRE',
        text: 'VOTRE RYTHME, VOS TENSIONS, VOS BESOINS.',
        url: 'https://form.typeform.com/to/EDlpdbdV',
        embedUrl: 'https://form.typeform.com/to/EDlpdbdV?typeform-embed-id=7111689052245918&typeform-embed=embed-widget&typeform-source=maison-muses.fr&typeform-medium=snippet&typeform-medium-version=next&embed-opacity=100&typeform-embed-handles-redirect=1',
        image: img('load-3', 'Massage du visage à Maison Muses Bien-être'),
      },
    ],
  },
  journal: {
    title: 'LE JOURNAL **DES MUSES**',
    cta: link('TOUT LE JOURNAL', '/journal'),
    filterAll: 'TOUT',
    filterArticles: 'ARTICLES',
    filterPodcast: 'PODCAST',
  },
};

/* ══════════════════════ RÉGLAGES (header, menu, footer, textes communs) ══════════════════════ */
export const SETTINGS = {
  logo: img('logo', 'Maison Muses'),
  header: {
    menuLabel: 'MENU',
    reserve: link('RÉSERVER', '#coffrets'),
  },
  // Image : affichée à droite du menu au survol du lien (les marques utilisent leur image de hero)
  menu: [
    { label: 'Accueil', url: '/', brands: false, image: img('hero', 'Maison Muses') },
    { label: 'Bien-être', url: '/bien-etre', brands: false, image: img('soin-img', 'Soin bien-être') },
    { label: 'Coiffure', url: '/coiffure', brands: false, image: img('marquee-1', 'Coiffure au salon') },
    { label: 'Nos marques', url: '', brands: true, image: img('slide-3', 'Nos marques') },
    { label: 'Coffrets', url: '#coffrets', brands: false, image: img('initiation-big', 'Coffret cadeau') },
    { label: 'L’équipe', url: '/equipe', brands: false, image: img('team-mid', 'L’équipe Maison Muses') },
    { label: 'Journal', url: '/journal', brands: false, image: img('july', 'Le journal des Muses') },
  ],
  // Menu déployé : intitulés des colonnes, encart « Première visite », liens Instagram
  menuPanel: {
    maisonTitle: 'LA MAISON',
    brandsTitle: 'NOS MARQUES',
    visit: { label: 'PREMIÈRE VISITE', text: 'Réservez une consultation de 30 minutes.', url: 'https://www.planity.com/' },
    socials: [
      link('@maison_muses_coiffure', 'https://www.instagram.com/maison_muses_coiffure/'),
      link('@maison_muses_bien_etre', 'https://www.instagram.com/maison_muses_bien_etre/'),
    ],
  },
  footer: {
    title: 'PRENEZ LE TEMPS.\n**ON S’OCCUPE DU RESTE**',
    cta: link('PRENDRE RENDEZ-VOUS', 'https://www.planity.com/'),
    places: [
      { name: 'MAISON MUSES COIFFURE', address: '48, All. Jean Jaurès,\nToulouse, 31000', phone: '07 67 66 02 67', mapAddress: '48 Allées Jean Jaurès, 31000 Toulouse, France' },
      { name: 'MAISON MUSES BIEN-ÊTRE', address: '11 Rue Bellegarde,\n31000 Toulouse', phone: '07 67 79 03 12', mapAddress: '11 Rue Bellegarde, 31000 Toulouse, France' },
    ],
    maisonTitle: 'LA MAISON',
    maisonLinks: [
      link('BIEN-ÊTRE', '/bien-etre'),
      link('COIFFURE', '/coiffure'),
      link('COFFRETS', '#coffrets'),
      link('L’ÉQUIPE', '/equipe'),
      link('JOURNAL', '/journal'),
    ],
    socialTitle: 'NOUS SUIVRE',
    socialLinks: [
      link('MAISON MUSE COIFFURE', '#'),
      link('MAISON MUSE BIEN-ÊTRE', '#'),
    ],
    copyright: '© MAISON MUSES',
    legalLinks: [link('MENTIONS LÉGALES', '/mentions-legales'), link('CONFIDENTIALITÉ', '/politique-de-confidentialite'), link('COOKIES', '#cookies')],
  },
  // Réservation : fenêtre de choix du salon (bouton RESERVER du header) et pages /reserver/… (module Planity)
  booking: {
    title: 'Réserver',
    text: 'Dans quel salon souhaitez-vous prendre rendez-vous ?',
    choices: [
      { label: 'Coiffure', place: 'Maison Muses Coiffure', address: '48 Allées Jean Jaurès, Toulouse', url: '/reserver/coiffure', image: img(['coiffure-poster', 'marquee-1'], 'L’espace coiffure') },
      { label: 'Bien-être', place: 'Maison Muses Bien-être', address: '11 Rue Bellegarde, Toulouse', url: '/reserver/bien-etre', image: img(['bien-etre-poster', 'soin-img'], 'L’espace bien-être') },
    ],
    coiffure: { eyebrow: 'Réserver', title: 'Espace coiffure', text: 'Choisissez votre prestation, votre coiffeur et votre créneau : la réservation se fait en quelques clics, avec la confirmation par e-mail.', planityKey: '-NQQ1msjYmTzuZ1zuRSU' },
    bienEtre: { eyebrow: 'Réserver', title: 'Espace bien-être', text: 'Choisissez votre soin et votre créneau : la réservation se fait en quelques clics, avec la confirmation par e-mail.', planityKey: '-OFu_IEQRuw6g1ctZOpl' },
    otherLabel: 'Réserver plutôt dans l’autre salon',
  },
  // Bandeau de consentement (components/layout/CookieBanner.astro) ; gtmId vide = aucune mesure d'audience
  cookies: {
    gtmId: '',
    title: 'Vos cookies, votre choix',
    text: 'Nous utilisons des cookies pour améliorer votre expérience de navigation et analyser notre trafic. Pour plus d’informations, consultez notre',
    accept: 'Tout accepter',
    refuse: 'Tout refuser',
    customize: 'Personnaliser',
    save: 'Enregistrer mes choix',
    analyticsLabel: 'Mesure d’audience',
    analyticsText: 'Google Analytics, via Google Tag Manager : statistiques de visite anonymisées pour améliorer le site.',
    policyLabel: 'Politique de confidentialité',
  },
  notFound: {
    title: 'PAGE **INTROUVABLE**',
    text: 'La page que vous cherchez n’existe pas ou a été déplacée.',
    cta: link('Retour à l’accueil', '/'),
  },
  brandLabels: {
    origin: 'Origine',
    qualities: 'Qualités',
    products: 'Les produits',
    booking: 'Réserver un soin',
    cursor: 'Cliquez pour en savoir plus',
    mobileHint: 'Cliquez sur les produits ci-dessous pour en savoir plus',
    available: 'Produit disponible à l’achat dans nos salons',
  },
};

/* ══════════════════════ PAGE L'ÉQUIPE ══════════════════════ */
export const EQUIPE = {
  seoTitle: 'L’équipe – Maison Muses, coiffure et bien-être à Toulouse',
  seoDescription: 'Moussine, coiffeur, et Violaine, praticienne bien-être : l’équipe de Maison Muses au centre de Toulouse.',
  hero: {
    title: 'L’EQUIPE',
    word: 'MUSES',
    text: 'La coiffure d’un côté, le bien-être de l’autre. \nDeux savoir-faire réunis pour prendre soin \nde nos muses, au centre de Toulouse.',
    tagline: 'Deux passions, \nune maison.',
    video: vid('presentation-video', 'prestige-big'),
    poster: img(['equipe-poster', 'team-left'], ''),
    playLabel: 'Lire la vidéo',
    rotateHint: 'Tournez votre téléphone pour voir la vidéo en plein écran',
  },
  members: [
    {
      name: 'Moussine',
      role: 'Coiffeur, fondateur',
      tag: '*Muses* Coiffure',
      lead: 'L’expérience internationale,\nle {coeur} à Toulouse.',
      bio: 'Coiffeur passionné de 34 ans, j’ai exercé à Toulouse, Paris, en Australie et à Dubaï. Aujourd’hui de retour dans ma ville de cœur, je vous accueille chez **Maison Muses** pour une expérience capillaire unique, guidée par l’expertise et la créativité.',
      cta: link('Réserver avec Moussine', 'https://www.planity.com/'),
      imageMain: img('marquee-follow-img', 'Moussine en pleine coupe'),
      imageSecond: img('moussine', 'Portrait de Moussine'),
    },
    {
      name: 'Violaine',
      role: 'Praticienne bien-être',
      tag: '*Muses* Bien-être',
      lead: 'Une parenthèse pour\nharmoniser le corps et l’esprit.',
      bio: 'Passionnée par l’esthétique et le bien-être depuis plus de douze ans, convaincue que la beauté extérieure reflète l’équilibre intérieur, j’aborde chaque soin de manière holistique, pour vous offrir une parenthèse sur-mesure.',
      cta: link('Réserver avec Violaine', 'https://www.planity.com/'),
      imageMain: img('violaine', 'Portrait de Violaine'),
      imageSecond: img('load-3', 'Soin du visage par Violaine'),
    },
  ],
};

/* ══════════════════════ PAGES JOURNAL ══════════════════════ */
export const JOURNAL = {
  seoTitle: 'Le journal – Maison Muses, coiffure et bien-être à Toulouse',
  seoDescription: 'Conseils coiffure, rituels bien-être et épisodes du podcast : le journal de Maison Muses.',
  titleItalic: 'Le journal des',
  titleMain: 'Muses',
  allLabel: 'Tous',
  featuredLabel: 'À la une',
  emptyText: 'Les premiers articles arrivent bientôt.',
  backLabel: 'Journal',
  cta: link('Prendre rendez-vous', 'https://www.planity.com/'),
  relatedTitleStart: 'À lire',
  relatedTitleEnd: 'aussi',
};

