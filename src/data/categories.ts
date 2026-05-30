import type { ProductCategory } from "@/lib/types";

export type SubCategory = {
  slug: string;
  label: string;
  icon: string;
  href: string;
  need?: string;
};

export type CategoryDef = {
  slug: ProductCategory | "marques" | "offres";
  label: string;
  description: string;
  href: string;
  icon: string;
  subcategories?: SubCategory[];
  popularSearches?: string[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "visage-peau",
    label: "Visage & peau",
    description: "Soins du visage, nettoyants et protection",
    href: "/boutique?categorie=visage-peau",
    icon: "✨",
    subcategories: [
      { slug: "hydratation", label: "Hydratation", icon: "💧", href: "/boutique?categorie=visage-peau&besoin=hydratation" },
      { slug: "anti-age", label: "Anti-âge", icon: "⏳", href: "/boutique?categorie=visage-peau&besoin=anti-âge" },
      { slug: "acne-imperfections", label: "Acné & imperfections", icon: "🫧", href: "/boutique?categorie=visage-peau&besoin=purifiant" },
      { slug: "protection-solaire", label: "Protection solaire", icon: "☀️", href: "/boutique?categorie=visage-peau&besoin=protection+solaire" },
      { slug: "nettoyage-visage", label: "Nettoyage visage", icon: "🧴", href: "/boutique?categorie=visage-peau&q=nettoyant" },
      { slug: "yeux-levres", label: "Yeux & lèvres", icon: "👁️", href: "/boutique?categorie=visage-peau&q=yeux" },
    ],
    popularSearches: ["Crème hydratante", "Sérum anti-âge", "SPF 50"],
  },
  {
    slug: "corps-hygiene",
    label: "Corps & hygiène",
    description: "Hygiène corporelle et soins quotidiens",
    href: "/boutique?categorie=corps-hygiene",
    icon: "🫧",
    subcategories: [
      { slug: "soin-corps", label: "Soin corps", icon: "🧴", href: "/boutique?categorie=corps-hygiene&besoin=hydratation" },
      { slug: "hygiene-quotidienne", label: "Hygiène quotidienne", icon: "🚿", href: "/boutique?categorie=corps-hygiene&q=gel+douche" },
      { slug: "deodorants", label: "Déodorants", icon: "🌸", href: "/boutique?categorie=corps-hygiene&q=déodorant" },
      { slug: "hygiene-intime", label: "Hygiène intime", icon: "🌿", href: "/boutique?categorie=corps-hygiene&q=intime" },
      { slug: "pieds-mains", label: "Pieds & mains", icon: "🤲", href: "/boutique?categorie=corps-hygiene&q=mains" },
    ],
    popularSearches: ["Gel douche bio", "Lait corporel", "Déodorant"],
  },
  {
    slug: "cheveux",
    label: "Cheveux",
    description: "Shampoings, soins et traitements capillaires",
    href: "/boutique?categorie=cheveux",
    icon: "💇",
    subcategories: [
      { slug: "chute-cheveux", label: "Chute de cheveux", icon: "💪", href: "/boutique?categorie=cheveux&besoin=fortifiant" },
      { slug: "shampoing-soin", label: "Shampoing & soin", icon: "🚿", href: "/boutique?categorie=cheveux&q=shampoing" },
      { slug: "masques-capillaires", label: "Masques capillaires", icon: "✨", href: "/boutique?categorie=cheveux&q=masque" },
      { slug: "cuir-chevelu", label: "Cuir chevelu", icon: "🌿", href: "/boutique?categorie=cheveux&besoin=apaisant" },
    ],
    popularSearches: ["Shampoing anti-chute", "Masque capillaire", "Huile cheveux"],
  },
  {
    slug: "bebe-maternite",
    label: "Bébé & maternité",
    description: "Produits adaptés aux tout-petits et futures mamans",
    href: "/boutique?categorie=bebe-maternite",
    icon: "👶",
    subcategories: [
      { slug: "hygiene-bebe", label: "Hygiène bébé", icon: "🛁", href: "/boutique?categorie=bebe-maternite&q=bébé" },
      { slug: "soin-peau-bebe", label: "Soin peau bébé", icon: "🍼", href: "/boutique?categorie=bebe-maternite&besoin=hydratation" },
      { slug: "maternite-grossesse", label: "Maternité & grossesse", icon: "🤰", href: "/boutique?categorie=bebe-maternite&q=grossesse" },
      { slug: "alimentation-bebe", label: "Alimentation bébé", icon: "🥛", href: "/boutique?categorie=bebe-maternite&q=alimentation" },
    ],
    popularSearches: ["Lingettes bébé", "Crème change", "Shampoing doux bébé"],
  },
  {
    slug: "complements",
    label: "Compléments alimentaires",
    description: "Vitamines, minéraux et compléments autorisés",
    href: "/boutique?categorie=complements",
    icon: "🌿",
    subcategories: [
      { slug: "immunite", label: "Immunité", icon: "🛡️", href: "/boutique?categorie=complements&q=immunité" },
      { slug: "vitamines-mineraux", label: "Vitamines & minéraux", icon: "💊", href: "/boutique?categorie=complements&q=vitamine" },
      { slug: "sport-performance", label: "Sport & performance", icon: "💪", href: "/boutique?categorie=complements&besoin=fortifiant" },
      { slug: "beaute-interieur", label: "Beauté de l'intérieur", icon: "✨", href: "/boutique?categorie=complements&besoin=anti-âge" },
      { slug: "digestion-transit", label: "Digestion & transit", icon: "🌿", href: "/boutique?categorie=complements&q=probiotique" },
    ],
    popularSearches: ["Vitamine C", "Magnésium", "Oméga 3", "Zinc"],
  },
  {
    slug: "bien-etre",
    label: "Bien-être",
    description: "Relaxation, sommeil et confort au quotidien",
    href: "/boutique?categorie=bien-etre",
    icon: "☀️",
    subcategories: [
      { slug: "relaxation-stress", label: "Relaxation & stress", icon: "🧘", href: "/boutique?categorie=bien-etre&besoin=détente" },
      { slug: "sommeil", label: "Sommeil", icon: "🌙", href: "/boutique?categorie=bien-etre&q=sommeil" },
      { slug: "massage-huiles", label: "Massage & huiles", icon: "💆", href: "/boutique?categorie=bien-etre&q=massage" },
      { slug: "articulations-muscles", label: "Articulations & muscles", icon: "🦴", href: "/boutique?categorie=bien-etre&besoin=apaisant" },
    ],
    popularSearches: ["Huile de massage", "Magnésium sommeil", "Roll-on relaxant"],
  },
  {
    slug: "dispositifs",
    label: "Dispositifs & accessoires",
    description: "Accessoires de santé et dispositifs médicaux",
    href: "/boutique?categorie=dispositifs",
    icon: "🩺",
    subcategories: [
      { slug: "mesure-controle", label: "Mesure & contrôle", icon: "📊", href: "/boutique?categorie=dispositifs&q=thermomètre" },
      { slug: "premiers-secours", label: "Premiers secours", icon: "🏥", href: "/boutique?categorie=dispositifs&q=compresse" },
      { slug: "protection-hygiene", label: "Protection & hygiène", icon: "🛡️", href: "/boutique?categorie=dispositifs&q=masque" },
    ],
    popularSearches: ["Thermomètre", "Tensiomètre", "Masques"],
  },
  {
    slug: "bio-naturel",
    label: "Bio & naturel",
    description: "Formules naturelles, bio et éco-responsables",
    href: "/boutique?categorie=bio-naturel",
    icon: "🍃",
    subcategories: [
      { slug: "soin-bio-visage", label: "Soins bio visage", icon: "🌸", href: "/boutique?categorie=bio-naturel&q=bio+visage" },
      { slug: "hygiene-bio", label: "Hygiène bio", icon: "🚿", href: "/boutique?categorie=bio-naturel&q=gel+douche+bio" },
      { slug: "huiles-vegetales", label: "Huiles végétales", icon: "🫒", href: "/boutique?categorie=bio-naturel&q=huile+végétale" },
      { slug: "naturel-certifie", label: "Certifiés naturels", icon: "✅", href: "/boutique?categorie=bio-naturel&q=naturel" },
    ],
    popularSearches: ["Huile végétale bio", "Gel douche naturel", "Savon bio"],
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
  "visage-peau": "Visage & peau",
  "corps-hygiene": "Corps & hygiène",
  cheveux: "Cheveux",
  "bebe-maternite": "Bébé & maternité",
  complements: "Compléments alimentaires",
  "bien-etre": "Bien-être",
  dispositifs: "Dispositifs & accessoires",
  "bio-naturel": "Bio & naturel",
};

// Navigation par besoin (indépendante des catégories)
export const BESOINS = [
  { slug: "peau-seche", label: "Peau sèche", icon: "💧", href: "/boutique?besoin=hydratation&peau=sèche" },
  { slug: "acne", label: "Acné", icon: "🫧", href: "/boutique?besoin=purifiant&categorie=visage-peau" },
  { slug: "chute-cheveux", label: "Chute de cheveux", icon: "💪", href: "/boutique?categorie=cheveux&besoin=fortifiant" },
  { slug: "grossesse", label: "Grossesse", icon: "🤰", href: "/boutique?categorie=bebe-maternite&q=grossesse" },
  { slug: "bebe", label: "Bébé", icon: "👶", href: "/boutique?categorie=bebe-maternite" },
  { slug: "hygiene-intime", label: "Hygiène intime", icon: "🌿", href: "/boutique?q=intime" },
  { slug: "immunite", label: "Immunité", icon: "🛡️", href: "/boutique?categorie=complements&q=immunité" },
  { slug: "sport", label: "Sport", icon: "💪", href: "/boutique?categorie=complements&besoin=fortifiant" },
  { slug: "anti-age", label: "Anti-âge", icon: "⏳", href: "/boutique?besoin=anti-âge" },
  { slug: "sommeil", label: "Sommeil", icon: "🌙", href: "/boutique?categorie=bien-etre&q=sommeil" },
  { slug: "stress", label: "Stress", icon: "🧘", href: "/boutique?categorie=bien-etre&besoin=détente" },
  { slug: "solaire", label: "Solaire", icon: "☀️", href: "/boutique?besoin=protection+solaire" },
];
