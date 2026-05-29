// scripts/migrate-products.mjs
// Lance avec : node scripts/migrate-products.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lecture manuelle du .env.local sans dotenv
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── Données du catalogue ─────────────────────────────────────

const BRANDS = [
  "Dermacare","NaturaDZ","HairPlus","BabySoft","WellVita","ZenBody",
  "MediCheck","BioAlgérie","PharmaDZ","SoinExpert","PureSkin","Vitalis",
  "AlgéSanté","Douceur","LaboVégétal","CareOne","HydraPlus","NutriForm",
  "EcoPara","MediSoft",
];

const PRODUCT_NEEDS = [
  "hydratation","anti-âge","purifiant","apaisant",
  "fortifiant","protection solaire","nutrition","détente",
];

const AGE_GROUPS = ["0–3 ans","Adulte","Tous âges"];

const BASE_COMPLIANCE = "Produit parapharmaceutique — non soumis à prescription. Ce produit ne remplace pas un avis médical. Consultez un professionnel de santé en cas de doute.";
const COMPLIANCE_COMPLEMENT = "Complément alimentaire — ne se substitue pas à une alimentation variée ni à un mode de vie sain. Tenir hors de portée des jeunes enfants.";
const COMPLIANCE_DEVICE = "Dispositif médical de parapharmacie — commercialisé dans le cadre réglementaire applicable en Algérie. Notice obligatoire fournie.";

const CATEGORY_QUOTAS = {
  "visage-peau": 220,
  "corps-hygiene": 220,
  "cheveux": 180,
  "bebe-maternite": 150,
  "complements": 180,
  "bien-etre": 180,
  "dispositifs": 120,
  "bio-naturel": 250,
};

const CATEGORY_TEMPLATES = {
  "visage-peau": {
    types: ["Gel nettoyant","Crème hydratante","Sérum éclat","Lotion tonique","Baume lèvres","Crème solaire SPF50","Masque visage","Démaquillant doux"],
    formats: ["50 ml","100 ml","150 ml","200 ml","30 ml"],
    skinTypes: ["normale","sèche","mixte","grasse","sensible"],
  },
  "corps-hygiene": {
    types: ["Gel douche","Lait corporel","Déodorant roll-on","Savon surgras","Gommage corps","Crème mains","Huile lavante"],
    formats: ["200 ml","300 ml","400 ml","500 ml","75 ml"],
  },
  "cheveux": {
    types: ["Shampoing","Après-shampoing","Masque capillaire","Huile nourrissante","Spray démêlant","Sérum anti-frisottis"],
    formats: ["200 ml","250 ml","400 ml","100 ml"],
  },
  "bebe-maternite": {
    types: ["Lingettes bébé","Crème change","Lait de toilette","Shampoing doux","Eau nettoyante","Baume réparateur"],
    formats: ["200 ml","300 ml","72 unités","100 ml","150 ml"],
    ageGroup: "0–3 ans",
  },
  "complements": {
    types: ["Vitamine C","Vitamine D3","Magnésium","Oméga 3","Zinc","Multivitamines","Probiotiques"],
    formats: ["30 comprimés","60 gélules","90 comprimés","20 sachets"],
    compliance: COMPLIANCE_COMPLEMENT,
  },
  "bien-etre": {
    types: ["Huile de massage","Infusion bien-être","Spray relaxant","Baume articulations","Roll-on essentiel"],
    formats: ["100 ml","50 ml","20 ml","200 ml"],
  },
  "dispositifs": {
    types: ["Thermomètre","Tensiomètre","Bandelettes test","Compresse stérile","Trousses premiers soins","Masques protection"],
    formats: ["1 unité","50 unités","10 unités","1 kit"],
    compliance: COMPLIANCE_DEVICE,
  },
  "bio-naturel": {
    types: ["Gel douche bio","Crème bio","Huile végétale bio","Dentifrice naturel","Déodorant bio","Savon solide bio"],
    formats: ["200 ml","100 ml","75 ml","300 ml","125 g"],
  },
};

function slugify(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function pseudoRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function buildProduct(category, index, globalId) {
  const tpl = CATEGORY_TEMPLATES[category];
  const type = tpl.types[index % tpl.types.length];
  const brand = BRANDS[(index + globalId) % BRANDS.length];
  const variant = Math.floor(index / tpl.types.length) + 1;
  const name = variant > 1 ? `${type} ${brand} — formule ${variant}` : `${type} ${brand}`;
  const slug = slugify(`${category}-${name}-${globalId}`);
  const priceBase = category === "dispositifs" ? 2500 : category === "complements" ? 1800 : 650;
  const price = Math.round((priceBase + pseudoRandom(globalId) * 4200) / 10) * 10;
  const hasPromo = pseudoRandom(globalId + 1) > 0.72;
  const compareAtPrice = hasPromo ? Math.round(price * 1.15) : null;
  const rating = Math.min(5, Math.round((3.8 + pseudoRandom(globalId + 2) * 1.1) * 10) / 10);
  const reviewCount = Math.floor(5 + pseudoRandom(globalId + 3) * 280);
  const inStock = pseudoRandom(globalId + 4) > 0.06;
  const format = tpl.formats[index % tpl.formats.length];
  const stock = inStock ? Math.floor(5 + pseudoRandom(globalId + 7) * 200) : 0;

  return {
    slug,
    name,
    brand,
    category,
    price,
    compare_at_price: compareAtPrice,
    stock,
    images: [`/images/products/${category}/product-${(globalId % 20) + 1}.jpg`],
    short_description: `${name} — soin parapharmaceutique pour un usage quotidien, format ${format}.`,
    description: `${name} est formulé pour répondre aux besoins de la catégorie ${category.replace(/-/g, " ")}. Texture agréable, usage simple, adapté à un public exigeant. Produit sélectionné par l'équipe Shifaa.`,
    benefits: ["Qualité contrôlée","Usage quotidien adapté","Formule transparente"],
    usage: "Suivre les indications sur l'emballage. En cas de doute, demandez conseil à un professionnel de santé.",
    precautions: category === "complements"
      ? "Ne pas dépasser la dose journalière recommandée. Réservé aux adultes sauf mention contraire."
      : "Usage externe. Éviter le contact avec les yeux. Cesser l'utilisation en cas d'irritation.",
    ingredients: category === "dispositifs"
      ? "N/A — se référer à la notice fabricant"
      : "Aqua, agents actifs, excipients cosmétiques ou alimentaires selon le produit.",
    compliance_note: tpl.compliance ?? BASE_COMPLIANCE,
    need: PRODUCT_NEEDS[globalId % PRODUCT_NEEDS.length],
    skin_type: tpl.skinTypes ? [tpl.skinTypes[index % tpl.skinTypes.length]] : null,
    age_group: tpl.ageGroup ?? AGE_GROUPS[globalId % AGE_GROUPS.length],
    format,
    is_new: pseudoRandom(globalId + 5) > 0.92,
    is_best_seller: pseudoRandom(globalId + 6) > 0.94,
    is_active: true,
    rating,
    review_count: reviewCount,
  };
}

function generateCatalog(total = 1500) {
  const products = [];
  let globalId = 1;
  for (const [category, quota] of Object.entries(CATEGORY_QUOTAS)) {
    for (let i = 0; i < quota; i++) {
      products.push(buildProduct(category, i, globalId++));
    }
  }
  while (products.length < total) {
    const cats = Object.keys(CATEGORY_QUOTAS);
    const cat = cats[products.length % cats.length];
    products.push(buildProduct(cat, products.length, globalId++));
  }
  return products.slice(0, total);
}

// ─── Migration ────────────────────────────────────────────────

async function migrate() {
  console.log("🚀 Génération des produits...");
  const products = generateCatalog(1500);
  console.log(`✅ ${products.length} produits générés`);

  console.log("🗑️  Nettoyage de la table products...");
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("❌ Erreur suppression :", deleteError.message);
    process.exit(1);
  }

  const BATCH_SIZE = 100;
  const batches = [];
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    batches.push(products.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Insertion en ${batches.length} batches de ${BATCH_SIZE}...`);

  let inserted = 0;
  for (let i = 0; i < batches.length; i++) {
    const { error } = await supabase.from("products").insert(batches[i]);
    if (error) {
      console.error(`\n❌ Erreur batch ${i + 1} :`, error.message);
      process.exit(1);
    }
    inserted += batches[i].length;
    process.stdout.write(`\r   ${inserted}/${products.length} produits insérés...`);
  }

  console.log("\n✅ Migration terminée !");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  console.log(`🎉 ${count} produits en base de données Supabase`);
}

migrate().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
