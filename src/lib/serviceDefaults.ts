// Contenu par défaut des pages coiffure et bien-être.
// Utilisé tant qu'un champ n'est pas rempli dans Sanity : la page n'est jamais vide.
// Les images sont des photos locales (public/images), désignées par leur nom.
export const SERVICE_DEFAULTS: Record<string, any> = {
  "coiffure": {
    "hero": {
      "eyebrow": "L’espace",
      "title": "Coiffure",
      "signature": "par Moussine",
      "video": [
        "muses-coiffure-bg",
        "prestige-big"
      ],
      "poster": [
        "coiffure-poster",
        "marquee-follow-img"
      ]
    },
    "approach": {
      "tag": "Notre approche",
      "title": "Un moment de valorisation et de détente pour vous sublimer, entièrement dédié aux femmes.",
      "text": "Nos techniques de travail allient précision et créativité pour sublimer chaque chevelure avec des résultats naturels et sur-mesure. Nous privilégions des soins haut de gamme et des méthodes respectueuses du cheveu.",
      "ctaLabel": "Prendre rendez-vous",
      "ctaUrl": "https://www.planity.com/",
      "bigImage": {
        "key": "follow-1",
        "alt": "Blond lumineux réalisé au salon"
      },
      "smallImage": {
        "key": "marquee-follow-img",
        "alt": "Coupe aux ciseaux"
      }
    },
    "gallery": [
      {
        "key": "marquee-1",
        "alt": "Balayage blond"
      },
      {
        "key": "marquee-follow-img",
        "alt": "Coupe aux ciseaux"
      },
      {
        "key": "slide-4",
        "alt": "Coupe mi-longue"
      },
      {
        "key": "harmonie-big",
        "alt": "Cheveux cuivrés"
      },
      {
        "key": "hero",
        "alt": "Cliente du salon"
      },
      {
        "key": "marquee-3",
        "alt": "Coloration"
      },
      {
        "key": "symbiose-big",
        "alt": "Brushing"
      }
    ],
    "steps": [
      {
        "tag": "Première visite",
        "title": "La consultation",
        "paragraphs": [
          "La consultation est ouverte à toutes celles qui souhaitent faire évoluer leur couleur.",
          "Elle est fortement recommandée pour toute première visite, même sans éclaircissement, et **obligatoire avant toute prestation impliquant un éclaircissement.**",
          "Ce rendez-vous est essentiel pour échanger sur vos envies, étudier vos inspirations, analyser votre historique capillaire, vous conseiller et réaliser une mèche test si nécessaire.",
          "Il nous permet de définir ensemble un projet couleur adapté à vos attentes et à vos cheveux."
        ],
        "ctaLabel": "Réserver une consultation",
        "ctaUrl": "https://www.planity.com/",
        "image": {
          "key": "marquee-1",
          "alt": "Consultation couleur"
        },
        "video": "consultation-video"
      },
      {
        "tag": "Pour toutes prestations",
        "title": "Le diagnostic",
        "paragraphs": [
          "Avant chaque prestation, un diagnostic personnalisé est réalisé pour analyser la nature de vos cheveux et définir la meilleure approche en fonction de vos attentes.",
          "Moins approfondi qu’une consultation, il permet toutefois de prendre en compte la texture, l’état de la fibre capillaire et vos envies, afin d’adapter notre travail à vos besoins tout en respectant la santé de vos cheveux."
        ],
        "ctaLabel": null,
        "ctaUrl": null,
        "image": {
          "key": "slide-4",
          "alt": "Diagnostic des cheveux"
        }
      }
    ],
    "brands": {
      "tag": "Nos marques",
      "title": "Pour moins, pour mieux",
      "text": "J’utilise des marques de cosmétiques engagées, axées sur la simplicité et l’efficacité. Inspirées par la science et la transparence, elles proposent des formules épurées, sans eau, sans ingrédients superflus, privilégiant des actifs puissants et ciblés. Pour des soins à la fois performants et respectueux de la peau.",
      "list": [
        "Maison Nord",
        "Atelier Vert",
        "Origine",
        "Lab–Zéro",
        "Pure & Co"
      ],
      "logos": [
        { "src": "/logo/eleven_australia.svg", "alt": "Eleven Australia" },
        { "src": "/logo/k18.svg", "alt": "K18" },
        { "src": "/logo/minimaliste.svg", "alt": "Minimaliste" },
        { "src": "/logo/patrice_mulato.svg", "alt": "Patrice Mulato" },
        { "src": "/logo/tokio_inkarami.svg", "alt": "Tokio Inkarami" },
        { "src": "/logo/trend_curls.svg", "alt": "Trend Curls" }
      ]
    },
    "social": {
      "tag": "Suivez-nous",
      "title": "Rejoignez-nous sur Instagram",
      "text": "Coulisses du salon, transformations et conseils d’entretien : retrouvez le quotidien de l’espace et laissez-vous inspirer avant votre prochaine visite.",
      "handle": "@maison_muses_coiffure",
      "url": "https://www.instagram.com/maison_muses_coiffure/"
    }
  },
  'bien-etre': {
    "hero": {
      "eyebrow": "L’espace",
      "title": "Bien-être",
      "signature": "par Violaine",
      "video": [
        "bg-hero-bien-etre",
        "soin-bg-video"
      ],
      "poster": [
        "bien-etre-poster",
        "ambiance-img"
      ]
    },
    "approach": {
      "tag": "L’institut de beauté",
      "title": "Retrouvez votre lumière intérieure et votre sérénité, pour elle et pour lui.",
      "text": "Dans la mythologie, les 9 Muses inspiraient l’harmonie et la créativité. Aujourd’hui chez Maison Muses Bien-Être, j’ai recréé ce sanctuaire pour vous. Ici, chaque femme et chaque homme devient une Muse.",
      "ctaLabel": "Prendre rendez-vous",
      "ctaUrl": "https://www.planity.com/",
      "bigImage": {
        "key": "soin-img",
        "alt": "Massage à l’institut"
      },
      "smallImage": {
        "key": "symbiose-little",
        "alt": "Soin du visage au rouleau de quartz"
      }
    },
    "gallery": [
      {
        "key": "initiation-big",
        "alt": "Massage du dos"
      },
      {
        "key": "load-3",
        "alt": "Soin du visage"
      },
      {
        "key": "ambiance-img",
        "alt": "L’ambiance de l’institut"
      },
      {
        "key": "IMG_6375",
        "alt": "Rehaussement de cils"
      },
      {
        "key": "marquee-6",
        "alt": "Massage du visage"
      },
      {
        "key": "symbiose-little",
        "alt": "Soin au rouleau de quartz"
      },
      {
        "key": "prestige-little",
        "alt": "Les soins utilisés à l’institut"
      }
    ],
    "steps": [
      {
        "tag": "Première visite",
        "title": "La consultation",
        "paragraphs": [
          "Pour votre première visite, nous vous conseillons de réserver une consultation de 30 minutes. Cela nous offrira l’occasion de se rencontrer et de discuter de vos idées et inspirations.",
          "Cette étape est essentielle, car elle nous permet de déterminer la faisabilité de votre projet. À l’issue de cette consultation, nous définirons ensemble la prestation la plus adaptée à vos besoins."
        ],
        "ctaLabel": "Réserver une consultation",
        "ctaUrl": "https://www.planity.com/",
        "image": {
          "key": "marquee-4",
          "alt": "Consultation à l’institut"
        }
      },
      {
        "tag": "Pour toutes prestations",
        "title": "Le diagnostic",
        "paragraphs": [
          "Je réalise un diagnostic approfondi pour comprendre vos besoins spécifiques, qu’il s’agisse d’un soin du visage, du corps ou d’esthétique. Ce bilan prend en compte vos attentes, vos antécédents et votre état général (peau, tonus musculaire, niveau de stress, de fatigue…).",
          "Grâce à cette évaluation, je personnalise chaque soin afin de garantir une efficacité maximale et un résultat optimal, tout en vous offrant un moment de bien-être complet."
        ],
        "ctaLabel": null,
        "ctaUrl": null,
        "image": {
          "key": "initiation-big",
          "alt": "Soin du dos à l’institut"
        }
      }
    ],
    "brands": {
      "tag": "Nos marques",
      "title": "Pour moins, pour mieux",
      "text": "J’utilise des marques de cosmétiques engagées, axées sur la simplicité et l’efficacité. Inspirées par la science et la transparence, elles proposent des formules épurées, sans eau, sans ingrédients superflus, privilégiant des actifs puissants et ciblés. Pour des soins à la fois performants et respectueux de la peau.",
      "list": [
        "Maison Nord",
        "Atelier Vert",
        "Origine",
        "Lab–Zéro",
        "Pure & Co"
      ],
      "logos": [
        { "src": "/logo/minimaliste_vert.svg", "alt": "Minimaliste" },
        { "src": "/logo/oceopin_vert.svg", "alt": "Océopin" }
      ]
    },
    "social": {
      "tag": "Suivez-nous",
      "title": "Rejoignez-nous sur Instagram",
      "text": "Coulisses du salon, transformations et conseils d’entretien : retrouvez le quotidien de l’espace et laissez-vous inspirer avant votre prochaine visite.",
      "handle": "@maison_muses_bien_etre",
      "url": "https://www.instagram.com/maison_muses_bien_etre/"
    }
  }
};
