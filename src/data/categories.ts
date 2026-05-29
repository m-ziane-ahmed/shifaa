import type { ProductCategory } from "@/lib/types";

export const CATEGORIES: {
  slug: ProductCategory | "marques" | "offres";
  label: string;
  description: string;
  href: string;
  icon: string;
}[] = [
  {
    slug: "visage-peau",
    label: "Visage et peau",
    description: "Soins du visage, nettoyants et protection",
    href: "/boutique?categorie=visage-peau",
    icon: "✨",
  },
  {
    slug: "corps-hygiene",
    label: "Corps et hygiène",
    description: "Hygiène corporelle et soins quotidiens",
    href: "/boutique?categorie=corps-hygiene",
    icon: "🫧",
  },
  {
    slug: "cheveux",
    label: "Cheveux",
    description: "Shampoings, soins et coiffants",
    href: "/boutique?categorie=cheveux",
    icon: "💇",
  },
  {
    slug: "bebe-maternite",
    label: "Bébé et maternité",
    description: "Produits adaptés aux tout-petits",
    href: "/boutique?categorie=bebe-maternite",
    icon: "👶",
  },
  {
    slug: "complements",
    label: "Compléments alimentaires",
    description: "Vitamines et compléments autorisés",
    href: "/boutique?categorie=complements",
    icon: "🌿",
  },
  {
    slug: "bien-etre",
    label: "Bien-être",
    description: "Confort et routines bien-être",
    href: "/boutique?categorie=bien-etre",
    icon: "☀️",
  },
  {
    slug: "dispositifs",
    label: "Dispositifs et accessoires",
    description: "Accessoires de santé autorisés",
    href: "/boutique?categorie=dispositifs",
    icon: "🩺",
  },
  {
    slug: "bio-naturel",
    label: "Bio et naturel",
    description: "Formules naturelles et bio",
    href: "/boutique?categorie=bio-naturel",
    icon: "🍃",
  },
  {
    slug: "marques",
    label: "Marques",
    description: "Découvrez nos marques partenaires",
    href: "/boutique?view=marques",
    icon: "🏷️",
  },
  {
    slug: "offres",
    label: "Offres du moment",
    description: "Promotions et bons plans",
    href: "/promotions",
    icon: "🎁",
  },
];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "visage-peau": "Visage et peau",
  "corps-hygiene": "Corps et hygiène",
  cheveux: "Cheveux",
  "bebe-maternite": "Bébé et maternité",
  complements: "Compléments alimentaires",
  "bien-etre": "Bien-être",
  dispositifs: "Dispositifs et accessoires",
  "bio-naturel": "Bio et naturel",
};
