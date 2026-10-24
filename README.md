# Maison Muses — Astro + Sanity + GSAP

```
maison-muses/
├─ src/
│  ├─ pages/index.astro        # assemble les sections
│  ├─ components/              # Header, Hero, Intro, Coffrets, Mission, Reviews, Routine, Footer, Lien, Tag, SanityImage
│  ├─ layouts/Layout.astro
│  ├─ lib/sanity.ts            # client + requêtes GROQ + urlFor
│  ├─ scripts/main.ts          # toutes les animations GSAP
│  └─ styles/global.css        # tokens, base, composants partagés (.lien, .tag…)
└─ studio/                     # Sanity Studio (schémas + contenu de départ)
```

## Mise en route

1. **Sanity** : créez un projet sur sanity.io/manage (notez le `projectId`).
2. **Studio** :
   ```bash
   cd studio && cp .env.example .env   # renseignez SANITY_STUDIO_PROJECT_ID
   npm install
   npx sanity login
   python3 seed/make_seed.py            # (déjà généré) → seed/seed.ndjson
   npx sanity dataset import seed/seed.ndjson production --replace
   npm run dev                          # http://localhost:3333
   ```
   Le seed reprend tout le texte de la maquette. Il ne contient pas d'images : ajoutez-les dans le Studio.
   Pensez à **publier** « Page d'accueil », « Réglages du site » et les documents liés (coffrets, équipe…).
3. **Site** :
   ```bash
   cp .env.example .env                 # SANITY_PROJECT_ID, SANITY_DATASET
   npm install && npm run dev
   ```
4. **Production** : déployez sur Netlify/Vercel/Cloudflare, puis créez un webhook Sanity (document publié) qui relance le build.
   Pensez à ajouter l'URL du site dans *API → CORS origins* si vous passez un jour à un fetch côté navigateur (inutile en statique).

## Animations GSAP (`src/scripts/main.ts`)

| Élément | Effet |
|---|---|
| Header | fond / couleur / flou animés via variables CSS (`--hb`, `--hc`, `--hblur`) après le hero |
| Hero | montée du titre, fondu du sous-titre et du logo, parallaxe de l'image |
| Titres `.big` (`data-split`) | révélation ligne par ligne (SplitText, re-découpe au resize) |
| `data-reveal` | fondu + montée au scroll (`ScrollTrigger.batch`) |
| Mosaïque | apparition en cascade |
| Coffrets | accordéon `height: 0 ↔ auto`, `clip-path` de la photo, cascade du contenu, `inert` sur les lignes fermées |
| Survols | flèches (`gap`), lignes du journal (`padding-left`), portraits (`border-radius`) |
| Ancres | défilement fluide (ScrollToPlugin) |

`prefers-reduced-motion` : les entrées sont désactivées et les transitions passent à 0 s.

## Points d'attention

- Les couleurs de survol (flèche, fond des lignes) restent en CSS : ce sont des changements de couleur, pas du mouvement.
- Le titre du hero reste sur une seule ligne (14 caractères max, validé dans le Studio).
- Un coffret sans description, ni image, ni « inclus » s'affiche comme une ligne non dépliable (comme Harmonie, Symbiose et Prestige dans la maquette).
