"""Génère seed.ndjson avec le contenu de la maquette HTML (sans images).
Usage :  python3 make_seed.py && cd .. && npx sanity dataset import seed/seed.ndjson production --replace
"""
import json

def k(i): return f"k{i}"
def ref(i, _id): return {"_type": "reference", "_ref": _id, "_key": k(i)}
def link(label, url): return {"_type": "link", "label": label, "url": url}

docs = []

coffrets = [
  ("coffret-initiation", "Coffret Initiation", "La parenthèse douceur", "80 €", dict(
    includes=[{"_key": "a", "label": "Bien-être", "title": "Massage relaxant 30 min"},
              {"_key": "b", "label": "Coiffure", "title": "Soin profond cheveux & coiffure au choix"}],
    description="Profitez d’une parenthèse de douceur avec un massage relaxant de 30 minutes chez Maison Muses Bien-être, suivi d’un soin profond pour vos cheveux et d’une coiffure au choix. Idéal pour découvrir l’alliance du bien-être et de la coiffure.",
    ctaLabel="Réserver", ctaUrl="#")),
  ("coffret-harmonie", "Coffret Harmonie", "L’expérience sur mesure", "Sur devis", {}),
  ("coffret-symbiose", "Coffret Symbiose", "L’expérience revitalisante", "185 à 305 €", {}),
  ("coffret-prestige", "Coffret Prestige", "La signature Maison Muses", "315 à 420 €", {}),
]
for _id, name, tag, price, extra in coffrets:
    docs.append({"_id": _id, "_type": "coffret", "name": name, "tagline": tag, "price": price, **extra})

members = [("member-moussine", "Moussine", "#Muses Coiffure"), ("member-july", "July", "#Muses Coiffure"), ("member-violaine", "Violaine", "#Muses Bien-être")]
for _id, n, t in members: docs.append({"_id": _id, "_type": "member", "name": n, "tag": t})

articles = ["Mars : libérer, faire circuler, renaître", "Pourquoi choisir un abonnement soin visage ?", "Découvrez L’Éveil Océopin, le soin anti-âge"]
for i, t in enumerate(articles): docs.append({"_id": f"article-{i+1}", "_type": "article", "title": t, "url": "#", "linkLabel": "Lire l’article"})

episodes = [("Patteform : aider les chiens, guider les maîtres", "2025-09-21"), ("Nid de nuances : fuir les codes pour mieux coiffer", "2025-07-21"), ("Manucure, karma & good vibes : Priscillia au micro", "2025-06-30")]
for i, (t, d) in enumerate(episodes): docs.append({"_id": f"episode-{i+1}", "_type": "episode", "title": t, "date": d, "url": "#"})

docs.append({
  "_id": "homepage", "_type": "homepage",
  "seoTitle": "Maison Muses – Coiffure et bien-être à Toulouse",
  "seoDescription": "Coiffure et bien-être, réunis sous un même toit au centre de Toulouse.",
  "hero": {"subtitle": "Coiffure et bien-être, réunis sous un même toit au centre de Toulouse.", "title": "MAISON MUSES"},
  "intro": {"title": "Des prestations haut de gamme pour une expérience bien-être complète",
            "text": "Notre histoire, c’est celle de trois passionnés qui ont réuni leur savoir-faire pour créer bien plus qu’un univers. Ensemble, nous avons façonné Maison Muses, un cocon où l’art de la coiffure et du bien-être se mêlent, dans une quête commune d’excellence et d’émotion."},
  "coffrets": {"title": "Choisissez votre expérience bien-être", "tag": "#Muses",
               "text": "Une journée coiffure et bien-être dans nos 2 établissements au centre ville de Toulouse. Une pause où notre équipe d’experts vous apporte des soins haut de gamme.",
               "items": [ref(i, c[0]) for i, c in enumerate(coffrets)]},
  "mission": {"eyebrow": "Notre mission", "title": "Révéler votre beauté naturelle",
              "text": "Notre équipe vous reçoit dans un environnement chaleureux et intimiste. Attentif à vos besoins, nous proposons systématiquement un diagnostic à toutes nos prestations. En cas de première visite, nous vous conseillons de réserver une consultation pour un diagnostic plus approfondi.",
              "primaryCta": link("Première visite ? Réserver ma consultation", "#"),
              "secondaryCta": link("Découvrir l’équipe", "#equipe"),
              "team": [ref(i, m[0]) for i, m in enumerate(members)]},
  "reviews": {"score": "5/5", "source": "sur Planity", "quotes": [
    "Je ressort à chaque fois plus heureuse que la fois d’avant ! July a parfaitement compris mon envie de rendu !",
    "L’accueil est top ! July est de super bons conseils et elle a des doigts de fée. C’est une parenthèse enchantée.",
    "Quel moment incroyable !! Massage relaxant, kobido, supers produits Minimaliste : tout est réuni pour que ma peau soit lumineuse et repulpée, un lâcher-prise total."]},
  "routine": {"title": "Votre routine personnalisée",
              "text": "Nous vous conseillons une gamme de produits suite à vos réponses au questionnaire. Une routine sur mesure conçue par notre équipe.",
              "diagnostics": [{"_key": "d1", "title": "Mon diagnostic capillaire", "ctaLabel": "Commencer", "url": "#"},
                              {"_key": "d2", "title": "Mon diagnostic visage", "ctaLabel": "Commencer", "url": "#"}],
              "advice": {"title": "Nos conseils d’experts", "items": [ref(i, f"article-{i+1}") for i in range(3)]},
              "podcast": {"title": "Le podcast : L’heure des Muses", "items": [ref(i, f"episode-{i+1}") for i in range(3)]}},
})

docs.append({
  "_id": "siteSettings", "_type": "siteSettings", "logo": "maison muses",
  "headerCta": link("Réserver – Offrir", "#coffrets"),
  "footer": {
    "title": "Votre expérience bien-être, un moment rien que pour vous.",
    "cta": link("Découvrir nos coffrets", "#coffrets"),
    "spaces": [
      {"_key": "s1", "title": "Espace coiffure", "details": "48 Allée Jean Jaurès, 31000 Toulouse\nLun, mar, mer, ven, sam 9h30 – 19h00\nJeudi 10h30 – 20h30"},
      {"_key": "s2", "title": "Espace bien-être", "details": "11 Rue Bellegarde, 31000 Toulouse\nDu mardi au vendredi 10h00 – 19h00\nSamedi 10h00 – 18h00\nTél. 07 67 79 03 12"}],
    "newsletter": {"title": "Newsletter", "text": "Recevez nos offres et nos conseils d’experts.", "cta": link("S’abonner", "#")},
    "socialsTitle": "Réseaux",
    "socials": [{"_key": "r1", "label": "Moussine", "handle": "maison_muses_coiffure"},
                {"_key": "r2", "label": "July", "handle": "maison_muses_july"},
                {"_key": "r3", "label": "Violaine", "handle": "maison_muses_bien_etre"}],
    "copyright": "© 2025 – Maison Muses",
    "legal": link("Mentions légales & politique de confidentialité", "#")},
})

with open("seed.ndjson", "w", encoding="utf-8") as f:
    for d in docs: f.write(json.dumps(d, ensure_ascii=False) + "\n")
print(len(docs), "documents → seed.ndjson")
