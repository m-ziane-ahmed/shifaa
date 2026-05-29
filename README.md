# Shifaa — Boutique parapharmacie (Algérie)

Site e-commerce Next.js pour la vente en ligne de produits **parapharmaceutiques** (hygiène, soins, compléments autorisés, accessoires). Positionnement distinct d’une pharmacie en ligne.

## Identité visuelle

| Élément | Valeur |
|--------|--------|
| Couleur principale | `#c4d778` |
| Couleur secondaire | `#4cb074` |
| Fond | `#FAF8F5` |
| Polices | Outfit + Fraunces |

## Démarrage

```bash
npm install
npm run catalog:images   # télécharge 80 visuels dans public/images/products/
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Arborescence

- `/` — Accueil
- `/boutique` — Catalogue + filtres
- `/produit/[slug]` — Fiche produit
- `/promotions`, `/nouveautes`
- `/conseils`, `/conseils/[slug]`
- `/panier`, `/commande`, `/commande/confirmation`
- `/compte`, `/compte/favoris`
- `/service-client` (+ livraison, retours, suivi)
- `/legal/*` — CGV, confidentialité, cookies, rétractation, périmètre
- `/a-propos`, `/contact`

## Avant mise en production

1. Valider le catalogue avec un expert réglementaire (Algérie).
2. Compléter les mentions légales (RC, NIF, adresse).
3. Brancher paiement CIB / Edahabia et logistique réelle.
4. Importer les 1500+ références (CMS ou base de données).
5. Faire auditer les allégations produits et contenus éditoriaux.

## Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- TypeScript
