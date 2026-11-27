import { defineArrayMember, defineField, defineType } from 'sanity';

/* ───────── Aides communes ───────── */

// Section d'une page : objet rangé dans son propre onglet
const section = (name: string, title: string, fields: any[], description?: string) =>
  defineField({ name, title, type: 'object', group: name, description, options: { collapsible: false }, fields });

const FORMAT = 'Mise en forme : **gras**, *italique*. Un retour à la ligne = une nouvelle ligne sur le site.';
const TITLE = 'Grand titre : les mots entre **…** sont épais, les autres fins. Un retour à la ligne = une nouvelle ligne.';
const BIG = 'Grand format : 1200 px minimum sur le petit côté.';
const SMALL = 'Petit format : 800 px minimum sur le petit côté.';

const text = (name: string, title: string, description = FORMAT, rows = 3) =>
  defineField({ name, title, type: 'text', rows, description });
const string = (name: string, title: string, description?: string) => defineField({ name, title, type: 'string', description });
const photo = (name: string, title: string, description = BIG) => defineField({ name, title, type: 'cmsImage', description });
const video = (name: string, title: string, description = 'MP4, idéalement moins de 10 Mo. Joué en boucle, sans son.') =>
  defineField({ name, title, type: 'file', options: { accept: 'video/mp4,video/webm' }, description });
const link = (name: string, title: string, description?: string) => defineField({ name, title, type: 'link', description });
const links = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'link' })], description });

const seo = [
  defineField({ name: 'seoTitle', title: 'Titre de la page (onglet du navigateur, Google)', type: 'string', group: 'seo', validation: (r) => r.max(70) }),
  defineField({ name: 'seoDescription', title: 'Description pour Google', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(160) }),
];

/* ══════════════════════ PAGE D'ACCUEIL ══════════════════════ */
export const homepage = defineType({
  name: 'homepage',
  title: 'Page d’accueil',
  type: 'document',
  groups: [
    { name: 'loader', title: '1. Écran de chargement', default: true },
    { name: 'hero', title: '2. Haut de page' },
    { name: 'intro', title: '3. Introduction' },
    { name: 'gallery', title: '4. Galerie' },
    { name: 'team', title: '5. Équipe' },
    { name: 'coffrets', title: '6. Coffrets' },
    { name: 'reviews', title: '7. Avis' },
    { name: 'routines', title: '8. Routines' },
    { name: 'journal', title: '9. Journal' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    ...seo,

    section('loader', 'Écran de chargement', [
      photo('load1', 'Photo 1'),
      photo('load2', 'Photo 2'),
      photo('load3', 'Photo 3'),
      photo('load4', 'Photo 4'),
    ], 'Les 4 photos qui s’ouvrent l’une dans l’autre au chargement. La dernière image est la vidéo du haut de page.'),

    section('hero', 'Haut de page', [
      string('heading', 'Titre principal (invisible à l’écran)', 'Lu par Google, les IA et les lecteurs d’écran : nom du salon, activité et ville. Ex. « Maison Muses, coiffure et bien-être à Toulouse ».'),
      text('subtitle', 'Phrase d’accroche', FORMAT, 2),
      video('video', 'Vidéo du portrait', 'Apparaît à la fin de l’écran de chargement puis reste dans le portrait. MP4 vertical, idéalement moins de 10 Mo.'),
      photo('portrait', 'Affiche de la vidéo', `${BIG} Affichée le temps que la vidéo charge.`),
      photo('reveal', 'Portrait révélé au défilement', `${BIG} Recouvre la vidéo en descendant vers l’introduction.`),
      photo('center', 'Portrait central de la galerie', `${BIG} Fait le relais entre l’introduction et la galerie.`),
    ]),

    section('intro', 'Introduction', [
      text('title', 'Titre', TITLE),
      text('text', 'Paragraphe', FORMAT, 5),
      link('ctaBienEtre', 'Bouton sous la photo'),
      link('ctaCoiffure', 'Bouton sous le paragraphe'),
      photo('image', 'Photo d’ambiance', SMALL),
      video('video', 'Vidéo'),
    ]),

    section('gallery', 'Galerie', [
      defineField({
        name: 'images',
        title: 'Photos qui défilent',
        type: 'array',
        of: [defineArrayMember({ type: 'cmsImage' })],
        description: `5 photos, placées autour du portrait central (onglet Haut de page). ${BIG}`,
        validation: (r) => r.max(5),
      }),
    ]),

    section('team', 'Équipe', [
      text('title', 'Titre', TITLE),
      text('text', 'Paragraphe', FORMAT, 5),
      link('cta', 'Bouton'),
      photo('thumb', 'Vignette dans le titre', SMALL),
      photo('left', 'Photo de gauche'),
      photo('mid', 'Photo du milieu'),
      photo('right', 'Photo de droite'),
    ]),

    section('coffrets', 'Coffrets', [
      text('title', 'Titre', 'Mise en forme : *italique*. Un retour à la ligne = une nouvelle ligne.'),
      text('text', 'Paragraphe', FORMAT, 4),
      string('prefix', 'Mot avant le nom de chaque coffret', 'Ex. COFFRET'),
      defineField({
        name: 'items',
        title: 'Les 4 coffrets, dans l’ordre d’affichage',
        description: 'Chaque emplacement a sa propre mise en page. Les coffrets se modifient dans « Contenus partagés → Coffrets ».',
        type: 'array',
        of: [defineArrayMember({ type: 'reference', to: [{ type: 'coffret' }] })],
        validation: (r) => r.max(4),
      }),
    ]),

    section('reviews', 'Avis', [
      text('title', 'Titre', TITLE, 2),
      defineField({ name: 'rating', title: 'Note (sur 5)', type: 'number', validation: (r) => r.min(0).max(5) }),
      string('ratingLabel', 'Texte sous la note'),
      link('cta', 'Bouton'),
      defineField({
        name: 'items',
        title: 'Avis qui défilent',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'review',
          title: 'Avis',
          fields: [
            defineField({ name: 'quote', title: 'Avis', type: 'text', rows: 3 }),
            defineField({ name: 'author', title: 'Prénom et initiale', type: 'string' }),
            defineField({ name: 'service', title: 'Prestation', type: 'string' }),
          ],
          preview: { select: { title: 'author', subtitle: 'quote' } },
        })],
      }),
    ]),

    section('routines', 'Routines', [
      text('title', 'Titre', TITLE, 2),
      text('text', 'Paragraphe', FORMAT, 3),
      string('prefix', 'Mot avant le nom de chaque routine', 'Ex. ROUTINE'),
      string('ctaLabel', 'Texte du bouton des deux portes'),
      defineField({
        name: 'doors',
        title: 'Les 2 portes',
        description: 'Première porte en orange, deuxième en vert. Un clic ouvre le questionnaire dans une fenêtre.',
        type: 'array',
        validation: (r) => r.max(2),
        of: [defineArrayMember({
          type: 'object',
          name: 'door',
          title: 'Porte',
          fields: [
            string('label', 'Nom (ex. COIFFURE)'),
            string('text', 'Phrase'),
            defineField({ name: 'image', title: 'Photo', type: 'cmsImage', description: BIG }),
            string('url', 'Lien du questionnaire', 'Adresse Typeform, ouverte dans un nouvel onglet si la fenêtre ne peut pas s’afficher.'),
            string('embedUrl', 'Lien du questionnaire dans la fenêtre', 'Adresse Typeform « embed » (copiée depuis le code d’intégration Typeform).'),
          ],
          preview: { select: { title: 'label', subtitle: 'text', media: 'image' } },
        })],
      }),
    ]),

    section('journal', 'Journal', [
      text('title', 'Titre', TITLE, 2),
      link('cta', 'Bouton'),
      string('filterAll', 'Filtre « tout »'),
      string('filterArticles', 'Filtre « articles »'),
      string('filterPodcast', 'Filtre « podcast »'),
    ], 'Les 5 derniers articles du journal s’affichent automatiquement.'),
  ],
  preview: { prepare: () => ({ title: 'Page d’accueil' }) },
});

/* ══════════════════════ RÉGLAGES DU SITE ══════════════════════ */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  groups: [
    { name: 'header', title: 'Haut de page et menu', default: true },
    { name: 'footer', title: 'Pied de page' },
    { name: 'brandLabels', title: 'Pages marques' },
    { name: 'notFound', title: 'Page introuvable (404)' },
    { name: 'booking', title: 'Réservation' },
    { name: 'cookies', title: 'Cookies et mesure d’audience' },
  ],
  fields: [
    defineField({ name: 'logo', title: 'Logo', type: 'cmsImage', group: 'header', description: 'SVG ou PNG transparent.' }),
    section('header', 'Haut de page', [
      string('menuLabel', 'Texte du bouton menu'),
      link('reserve', 'Bouton de droite'),
    ]),
    defineField({
      name: 'menu',
      title: 'Liens du menu',
      group: 'header',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        name: 'menuItem',
        title: 'Lien',
        fields: [
          string('label', 'Texte'),
          string('url', 'Adresse', '/page, lien externe ou #ancre de l’accueil (ex. #coffrets)'),
          defineField({ name: 'brands', title: 'Liste des marques', type: 'boolean', initialValue: false, description: 'Coché : cette entrée n’est pas un lien, elle correspond à la colonne « Nos marques » (marques publiées, avec l’image de hero de chacune).' }),
          defineField({ name: 'image', title: 'Image au survol', type: 'cmsImage', description: 'Affichée à droite du menu quand on survole ce lien. Format portrait conseillé.' }),
        ],
        preview: { select: { title: 'label', subtitle: 'url' } },
      })],
    }),
    defineField({
      name: 'menuPanel',
      title: 'Menu déployé',
      group: 'header',
      type: 'object',
      options: { collapsible: false },
      description: 'Intitulés des colonnes, encart « Première visite » et liens Instagram du menu.',
      fields: [
        string('maisonTitle', 'Intitulé de la colonne des pages'),
        string('brandsTitle', 'Intitulé de la colonne des marques'),
        defineField({
          name: 'visit',
          title: 'Encart « Première visite »',
          type: 'object',
          fields: [string('label', 'Petit titre'), text('text', 'Texte', FORMAT, 2), string('url', 'Adresse du lien')],
        }),
        links('socials', 'Liens Instagram (texte affiché + adresse)'),
      ],
    }),
    section('footer', 'Pied de page', [
      text('title', 'Titre', TITLE, 2),
      link('cta', 'Bouton'),
      defineField({
        name: 'places',
        title: 'Établissements',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'place',
          title: 'Établissement',
          fields: [
            string('name', 'Nom'),
            text('address', 'Adresse affichée', 'Un retour à la ligne = une nouvelle ligne.', 2),
            string('phone', 'Téléphone'),
            string('mapAddress', 'Adresse pour la carte', 'Adresse complète, pour placer le point sur la carte.'),
          ],
          preview: { select: { title: 'name', subtitle: 'phone' } },
        })],
      }),
      string('maisonTitle', 'Titre de la première colonne de liens'),
      links('maisonLinks', 'Liens de la première colonne'),
      string('socialTitle', 'Titre de la deuxième colonne de liens'),
      links('socialLinks', 'Liens de la deuxième colonne (réseaux)'),
      string('copyright', 'Copyright', 'L’année est ajoutée automatiquement.'),
      links('legalLinks', 'Liens légaux'),
    ]),
    section('booking', 'Réservation', [
      string('title', 'Fenêtre de choix : titre'),
      text('text', 'Fenêtre de choix : texte', FORMAT, 2),
      defineField({
        name: 'choices',
        title: 'Fenêtre de choix : les deux salons',
        type: 'array',
        validation: (r) => r.max(2),
        of: [defineArrayMember({
          type: 'object',
          name: 'bookingChoice',
          fields: [
            string('label', 'Intitulé'),
            string('place', 'Nom du salon'),
            string('address', 'Adresse courte'),
            string('url', 'Page de réservation', '/reserver/coiffure ou /reserver/bien-etre'),
            photo('image', 'Photo', SMALL),
          ],
          preview: { select: { title: 'place', subtitle: 'url', media: 'image' } },
        })],
      }),
        defineField({
          name: 'coiffure',
          title: 'Page « Réserver : espace coiffure » (/reserver/coiffure)',
          type: 'object',
          fields: [
            string('eyebrow', 'Petit titre'),
            string('title', 'Titre'),
            text('text', 'Texte d’introduction', FORMAT, 2),
            string('planityKey', 'Clé du module Planity', 'Fournie par Planity dans le code d’intégration (window.planity = { key: … }).'),
          ],
        }),
        defineField({
          name: 'bienEtre',
          title: 'Page « Réserver : espace bien-être » (/reserver/bien-etre)',
          type: 'object',
          fields: [
            string('eyebrow', 'Petit titre'),
            string('title', 'Titre'),
            text('text', 'Texte d’introduction', FORMAT, 2),
            string('planityKey', 'Clé du module Planity', 'Fournie par Planity dans le code d’intégration (window.planity = { key: … }).'),
          ],
        }),
      string('otherLabel', 'Lien vers l’autre salon (bas de page)'),
    ], 'Le bouton RESERVER du haut de page ouvre la fenêtre de choix du salon ; chaque salon a sa page avec le module de réservation Planity.'),
    section('cookies', 'Cookies et mesure d’audience', [
      defineField({ name: 'gtmId', title: 'Identifiant Google Tag Manager', type: 'string', description: 'Format GTM-XXXXXXX. Google Analytics se configure dans GTM. Chargé uniquement si le visiteur accepte la mesure d’audience. Vide : aucune mesure.', validation: (r) => r.regex(/^GTM-[A-Z0-9]+$/, { name: 'GTM' }).warning('Format attendu : GTM-XXXXXXX') }),
      string('title', 'Titre du bandeau'),
      text('text', 'Texte du bandeau', FORMAT, 3),
      string('accept', 'Bouton « tout accepter »'),
      string('refuse', 'Bouton « tout refuser »'),
      string('customize', 'Bouton « personnaliser »'),
      string('save', 'Bouton « enregistrer mes choix »'),
      string('analyticsLabel', 'Mesure d’audience : intitulé'),
      text('analyticsText', 'Mesure d’audience : explication', FORMAT, 2),
      string('policyLabel', 'Texte du lien vers la politique de confidentialité'),
    ], 'Bandeau de consentement (conforme CNIL : accepter, refuser, personnaliser ; choix gardé 6 mois). Le lien « Cookies » du pied de page doit pointer vers #cookies pour rouvrir les réglages.'),
    section('notFound', 'Page introuvable (404)', [
      text('title', 'Titre', TITLE, 2),
      text('text', 'Texte', FORMAT, 2),
      link('cta', 'Bouton'),
    ], 'Affichée quand une adresse n’existe pas.'),
    section('brandLabels', 'Pages marques', [
      string('origin', 'Intitulé « Origine »'),
      string('qualities', 'Intitulé « Qualités »'),
      string('products', 'Intitulé « Les produits »'),
      string('booking', 'Texte du lien de réservation (fenêtre produit)'),
      string('cursor', 'Texte affiché au survol du slider des produits'),
      string('mobileHint', 'Phrase au-dessus du slider des produits (mobile)'),
      string('available', 'Mention au-dessus du lien de réservation (fenêtre produit)'),
    ], 'Textes communs à toutes les pages marques.'),
  ],
  preview: { prepare: () => ({ title: 'Réglages du site' }) },
});

/* ══════════════════════ PAGE L'ÉQUIPE ══════════════════════ */
export const equipePage = defineType({
  name: 'equipePage',
  title: 'Page L’équipe',
  type: 'document',
  groups: [
    { name: 'hero', title: '1. Haut de page', default: true },
    { name: 'members', title: '2. Membres' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    ...seo,
    section('hero', 'Haut de page', [
      string('title', 'Titre'),
      string('word', 'Grand mot'),
      text('text', 'Paragraphe'),
      text('tagline', 'Phrase en italique', FORMAT, 2),
      video('video', 'Vidéo de présentation', 'Avec le son : muette en boucle, le bouton la lance avec le son. MP4.'),
      photo('poster', 'Affiche de la vidéo'),
      string('playLabel', 'Texte du bouton de lecture'),
      string('rotateHint', 'Indication sous la vidéo sur mobile', 'Invite à tourner le téléphone pour voir la vidéo en plein écran.'),
    ], 'Les deux photos du haut de page sont celles des membres (onglet Membres).'),
    defineField({
      name: 'members',
      title: 'Membres',
      group: 'members',
      description: 'Autant de membres que nécessaire. Ils sont regroupés par étiquette (*Muses* Coiffure, *Muses* Bien-être…), dans l’ordre de la liste ; une étiquette contenant « bien-être » affiche la fiche sur fond vert. Le haut de page montre le premier membre coiffure et le premier membre bien-être.',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        name: 'teamMember',
        title: 'Membre',
        fields: [
          string('name', 'Prénom'),
          string('role', 'Métier'),
          text('tag', 'Étiquette', FORMAT, 1),
          text('lead', 'Accroche', `${FORMAT} Écrire {coeur} pour afficher le petit cœur.`, 2),
          text('bio', 'Présentation', FORMAT, 5),
          link('cta', 'Bouton'),
          photo('imageMain', 'Photo principale'),
          photo('imageSecond', 'Deuxième photo (au survol dans le haut de page)'),
        ],
        preview: { select: { title: 'name', subtitle: 'role', media: 'imageMain' } },
      })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Page L’équipe' }) },
});

/* ══════════════════════ PAGES JOURNAL (textes communs) ══════════════════════ */
export const journalPage = defineType({
  name: 'journalPage',
  title: 'Pages journal',
  type: 'document',
  groups: [
    { name: 'texts', title: 'Textes', default: true },
    { name: 'seo', title: 'Référencement (page Journal)' },
  ],
  fields: [
    ...seo,
    defineField({ name: 'titleItalic', title: 'Titre : partie en italique', type: 'string', group: 'texts' }),
    defineField({ name: 'titleMain', title: 'Titre : grand mot', type: 'string', group: 'texts' }),
    defineField({ name: 'allLabel', title: 'Filtre « tous »', type: 'string', group: 'texts' }),
    defineField({ name: 'featuredLabel', title: 'Étiquette de l’article à la une', type: 'string', group: 'texts' }),
    defineField({ name: 'emptyText', title: 'Texte quand il n’y a encore aucun article', type: 'string', group: 'texts' }),
    defineField({ name: 'backLabel', title: 'Article : lien de retour au journal', type: 'string', group: 'texts' }),
    defineField({ name: 'cta', title: 'Article : bouton en fin d’article', type: 'link', group: 'texts' }),
    defineField({ name: 'relatedTitleStart', title: 'Article : titre « À lire aussi », 1re partie', type: 'string', group: 'texts' }),
    defineField({ name: 'relatedTitleEnd', title: 'Article : titre « À lire aussi », 2e partie', type: 'string', group: 'texts' }),
  ],
  preview: { prepare: () => ({ title: 'Pages journal' }) },
});
