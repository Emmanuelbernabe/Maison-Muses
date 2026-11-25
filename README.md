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
   npm run dev                          # http://localhost:3333
   ```
   **Contenu** : tous les textes, images, vidéos et liens du site sont dans Sanity. Pour remplir un dataset vide
   avec le contenu de référence (`src/lib/content-defaults.ts`), depuis la racine du projet :
   ```bash
   node --env-file=.env scripts/import-content.ts            # simulation : affiche ce qui serait écrit
   node --env-file=.env scripts/import-content.ts --write    # écrit dans Sanity (SANITY_WRITE_TOKEN requis)
   ```
   Un champ vidé dans le Studio reprend sa valeur de référence : le site ne casse jamais.
   Mise en forme dans les textes : `**gras**`, `*italique*`, retour à la ligne = nouvelle ligne.
3. **Site** :
   ```bash
   cp .env.example .env                 # SANITY_PROJECT_ID, SANITY_DATASET
   npm install && npm run dev
   ```
4. **Production** : déploiement automatique, voir ci-dessous.

## Déploiement automatique (`.github/workflows/deploy.yml`)

| Événement | Ce qui se passe |
|---|---|
| Publication dans Sanity | webhook → GitHub Actions → site public reconstruit et redéployé (worker `maison-muses`) |
| Push sur `main` | site public **et** site d'aperçu (`maison-muses-preview`) redéployés |
| Onglet *Actions* → *Run workflow* | redéploiement manuel des deux |

Le site d'aperçu (onglet « Modifier le site » du Studio) lit les brouillons en direct : il n'a pas besoin d'être reconstruit à chaque publication.

**Mise en place (une seule fois)**

1. **Cloudflare** — *My Profile → API Tokens → Create Token*, modèle **Edit Cloudflare Workers**. Noter aussi l'**Account ID** (page d'accueil du compte, colonne de droite).
2. **GitHub, secrets** — dépôt → *Settings → Secrets and variables → Actions → New repository secret* :
   `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SANITY_API_READ_TOKEN` (jeton Sanity *Viewer*), et si besoin `PUBLIC_GOOGLE_MAPS_API_KEY`.
3. **GitHub, jeton pour Sanity** — *Settings (du compte) → Developer settings → Fine-grained tokens → Generate* :
   dépôt **Maison-Muses** uniquement, permission **Contents : Read and write**. Il sert seulement à déclencher le workflow.
4. **Sanity, webhook** — sanity.io/manage → projet → *API → Webhooks → Create webhook* :
   - URL : `https://api.github.com/repos/Emmanuelbernabe/Maison-Muses/dispatches`
   - Dataset : `production` · Trigger on : *Create*, *Update*, *Delete* · Filtre : (vide) · Drafts : **décoché**
   - Projection : `{"event_type": "sanity-publish"}`
   - HTTP method : `POST` · API version : (par défaut)
   - HTTP headers : `Authorization` = `Bearer <jeton GitHub de l'étape 3>`, `Accept` = `application/vnd.github+json`

Test : publier une modification dans le Studio, puis suivre le déploiement dans l'onglet *Actions* du dépôt GitHub (1 à 2 minutes).

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
