import type { Product, ProductCategory } from "@/lib/types";
import { getLocalProductImage, getLocalProductGallery } from "@/data/catalog-images";
import { PRODUCT_NEEDS } from "@/lib/store-types";
import { WILAYAS } from "@/data/wilayas";

const BASE_COMPLIANCE =
  "Produit parapharmaceutique — non soumis à prescription. Ce produit ne remplace pas un avis médical. Consultez un professionnel de santé en cas de doute.";

const COMPLIANCE_COMPLEMENT =
  "Complément alimentaire — ne se substitue pas à une alimentation variée ni à un mode de vie sain. Tenir hors de portée des jeunes enfants.";

const COMPLIANCE_DEVICE =
  "Dispositif médical de parapharmacie — commercialisé dans le cadre réglementaire applicable en Algérie. Notice obligatoire fournie.";

/** Répartition cible sur 1500 références */
const CATEGORY_QUOTAS: Record<ProductCategory, number> = {
  "visage-peau": 220,
  "corps-hygiene": 220,
  "cheveux": 180,
  "bebe-maternite": 150,
  "complements": 180,
  "bien-etre": 180,
  "dispositifs": 120,
  "bio-naturel": 250,
};

const BRANDS = [
  "Dermacare",
  "NaturaDZ",
  "HairPlus",
  "BabySoft",
  "WellVita",
  "ZenBody",
  "MediCheck",
  "BioAlgérie",
  "PharmaDZ",
  "SoinExpert",
  "PureSkin",
  "Vitalis",
  "AlgéSanté",
  "Douceur",
  "LaboVégétal",
  "CareOne",
  "HydraPlus",
  "NutriForm",
  "EcoPara",
  "MediSoft",
];

type CategoryTemplate = {
  types: string[];
  formats: string[];
  skinTypes?: string[];
  ageGroup?: string;
  compliance?: string;
};

const CATEGORY_TEMPLATES: Record<ProductCategory, CategoryTemplate> = {
  "visage-peau": {
    types: [
      "Gel nettoyant",
      "Crème hydratante",
      "Sérum éclat",
      "Lotion tonique",
      "Baume lèvres",
      "Crème solaire SPF50",
      "Masque visage",
      "Démaquillant doux",
    ],
    formats: ["50 ml", "100 ml", "150 ml", "200 ml", "30 ml"],
    skinTypes: ["normale", "sèche", "mixte", "grasse", "sensible"],
  },
  "corps-hygiene": {
    types: [
      "Gel douche",
      "Lait corporel",
      "Déodorant roll-on",
      "Savon surgras",
      "Gommage corps",
      "Crème mains",
      "Huile lavante",
    ],
    formats: ["200 ml", "300 ml", "400 ml", "500 ml", "75 ml"],
  },
  cheveux: {
    types: [
      "Shampoing",
      "Après-shampoing",
      "Masque capillaire",
      "Huile nourrissante",
      "Spray démêlant",
      "Sérum anti-frisottis",
    ],
    formats: ["200 ml", "250 ml", "400 ml", "100 ml"],
  },
  "bebe-maternite": {
    types: [
      "Lingettes bébé",
      "Crème change",
      "Lait de toilette",
      "Shampoing doux",
      "Eau nettoyante",
      "Baume réparateur",
    ],
    formats: ["200 ml", "300 ml", "72 unités", "100 ml", "150 ml"],
    ageGroup: "0–3 ans",
  },
  complements: {
    types: [
      "Vitamine C",
      "Vitamine D3",
      "Magnésium",
      "Oméga 3",
      "Zinc",
      "Multivitamines",
      "Probiotiques",
    ],
    formats: ["30 comprimés", "60 gélules", "90 comprimés", "20 sachets"],
    compliance: COMPLIANCE_COMPLEMENT,
  },
  "bien-etre": {
    types: [
      "Huile de massage",
      "Infusion bien-être",
      "Spray relaxant",
      "Baume articulations",
      "Roll-on essentiel",
    ],
    formats: ["100 ml", "50 ml", "20 ml", "200 ml"],
  },
  dispositifs: {
    types: [
      "Thermomètre",
      "Tensiomètre",
      "Bandelettes test",
      "Compresse stérile",
      "Trousses premiers soins",
      "Masques protection",
    ],
    formats: ["1 unité", "50 unités", "10 unités", "1 kit"],
    compliance: COMPLIANCE_DEVICE,
  },
  "bio-naturel": {
    types: [
      "Gel douche bio",
      "Crème bio",
      "Huile végétale bio",
      "Dentifrice naturel",
      "Déodorant bio",
      "Savon solide bio",
    ],
    formats: ["200 ml", "100 ml", "75 ml", "300 ml", "125 g"],
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function buildProduct(category: ProductCategory, index: number, globalId: number): Product {
  const tpl = CATEGORY_TEMPLATES[category];
  const type = tpl.types[index % tpl.types.length];
  const brand = BRANDS[(index + globalId) % BRANDS.length];
  const variant = Math.floor(index / tpl.types.length) + 1;
  const name = variant > 1 ? `${type} ${brand} — formule ${variant}` : `${type} ${brand}`;
  const slug = slugify(`${category}-${name}-${globalId}`);
  const priceBase = category === "dispositifs" ? 2500 : category === "complements" ? 1800 : 650;
  const price =
    Math.round((priceBase + pseudoRandom(globalId) * 4200) / 10) * 10;
  const hasPromo = pseudoRandom(globalId + 1) > 0.72;
  const compareAtPrice = hasPromo ? Math.round(price * 1.15) : undefined;
  const rating = Math.round((3.8 + pseudoRandom(globalId + 2) * 1.1) * 10) / 10;
  const reviewCount = Math.floor(5 + pseudoRandom(globalId + 3) * 280);
  const inStock = pseudoRandom(globalId + 4) > 0.06;
  const format = tpl.formats[index % tpl.formats.length];
  const need = PRODUCT_NEEDS[globalId % PRODUCT_NEEDS.length];
  const wilayaCodes = WILAYAS.filter((_, wi) => pseudoRandom(globalId + wi) > 0.12).map((w) => w.code);
  const ageGroup =
    tpl.ageGroup ?? AGE_GROUPS[globalId % AGE_GROUPS.length];

  return {
    id: String(globalId),
    slug,
    name,
    brand,
    category,
    price,
    compareAtPrice,
    image: getLocalProductImage(category, globalId),
    images: getLocalProductGallery(category, globalId),
    rating: Math.min(5, rating),
    reviewCount,
    inStock,
    isNew: pseudoRandom(globalId + 5) > 0.92,
    isBestSeller: pseudoRandom(globalId + 6) > 0.94,
    shortDescription: `${name} — soin parapharmaceutique pour un usage quotidien, format ${format}.`,
    description: `${name} est formulé pour répondre aux besoins de la catégorie ${category.replace("-", " ")}. Texture agréable, usage simple, adapté à un public exigeant. Produit sélectionné par l'équipe Shifaa.`,
    benefits: [
      "Qualité contrôlée",
      "Usage quotidien adapté",
      "Formule transparente",
    ],
    usage: "Suivre les indications sur l'emballage. En cas de doute, demandez conseil à un professionnel de santé.",
    precautions:
      category === "complements"
        ? "Ne pas dépasser la dose journalière recommandée. Réservé aux adultes sauf mention contraire."
        : "Usage externe. Éviter le contact avec les yeux. Cesser l'utilisation en cas d'irritation.",
    ingredients:
      category === "dispositifs"
        ? "N/A — se référer à la notice fabricant"
        : "Aqua, agents actifs, excipients cosmétiques ou alimentaires selon le produit.",
    complianceNote: tpl.compliance ?? BASE_COMPLIANCE,
    need,
    wilayas: wilayaCodes.length ? wilayaCodes : WILAYAS.map((w) => w.code),
    skinType: tpl.skinTypes ? [tpl.skinTypes[index % tpl.skinTypes.length]] : globalId % 3 === 0 ? [SKIN_TYPES[globalId % SKIN_TYPES.length]] : undefined,
    ageGroup,
    format,
  };
}

export function generateCatalog(total = 1500): Product[] {
  const products: Product[] = [];
  let globalId = 1;

  (Object.keys(CATEGORY_QUOTAS) as ProductCategory[]).forEach((category) => {
    const quota = CATEGORY_QUOTAS[category];
    for (let i = 0; i < quota; i++) {
      products.push(buildProduct(category, i, globalId));
      globalId++;
    }
  });

  while (products.length < total) {
    const cats = Object.keys(CATEGORY_QUOTAS) as ProductCategory[];
    const cat = cats[products.length % cats.length];
    products.push(buildProduct(cat, products.length, globalId));
    globalId++;
  }

  return products.slice(0, total);
}

export const SKIN_TYPES = ["normale", "sèche", "mixte", "grasse", "sensible"] as const;
export const AGE_GROUPS = ["0–3 ans", "Adulte", "Tous âges"] as const;
export const FORMAT_LIST = ["30 ml", "50 ml", "75 ml", "100 ml", "150 ml", "200 ml", "250 ml", "300 ml", "400 ml", "500 ml", "30 comprimés", "60 gélules", "1 unité", "1 kit"] as const;
export const NEED_LIST = [...PRODUCT_NEEDS];

export const BRAND_LIST = [...BRANDS].sort();
