export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags?: string[];
}

export const ARTICLES: Article[] = [
  // ── PEAU ────────────────────────────────────────────────
  {
    slug: "routine-peau-ete",
    title: "Adapter sa routine peau en été",
    excerpt: "Conseils pratiques pour hydrater et protéger votre peau lors des fortes chaleurs algériennes.",
    category: "Peau",
    readTime: "5 min",
    date: "2026-05-15",
    tags: ["hydratation", "été", "SPF"],
  },
  {
    slug: "peau-seche-solutions",
    title: "Peau sèche : causes et solutions efficaces",
    excerpt: "Comprendre pourquoi votre peau tiraille et choisir les bons actifs — céramides, urée, acide hyaluronique.",
    category: "Peau",
    readTime: "6 min",
    date: "2026-05-08",
    tags: ["peau sèche", "céramides", "hydratation"],
  },
  {
    slug: "acne-adulte-guide",
    title: "Acné adulte : guide complet pour en venir à bout",
    excerpt: "L'acné ne touche pas que les adolescents. Découvrez les routines et ingrédients recommandés par les dermatologues.",
    category: "Peau",
    readTime: "8 min",
    date: "2026-04-22",
    tags: ["acné", "niacinamide", "BHA"],
  },
  {
    slug: "spf-guide-choix",
    title: "Bien choisir sa protection solaire : SPF, UVA, UVB",
    excerpt: "Décryptage des indices et textures pour une photoprotection efficace, toute l'année.",
    category: "Peau",
    readTime: "7 min",
    date: "2026-04-10",
    tags: ["solaire", "SPF50", "UVB"],
  },
  {
    slug: "anti-age-premiers-gestes",
    title: "Anti-âge : les premiers gestes dès 30 ans",
    excerpt: "Rétinol, vitamine C, peptides… quels actifs intégrer et dans quel ordre pour des résultats visibles.",
    category: "Peau",
    readTime: "6 min",
    date: "2026-03-18",
    tags: ["anti-âge", "rétinol", "collagène"],
  },

  // ── HYGIÈNE ─────────────────────────────────────────────
  {
    slug: "hygiene-mains",
    title: "Hygiène des mains au quotidien",
    excerpt: "Bonnes pratiques sans agresser la peau : fréquence, produits adaptés, soin post-lavage.",
    category: "Hygiène",
    readTime: "3 min",
    date: "2026-04-20",
    tags: ["mains", "lavage", "désinfection"],
  },
  {
    slug: "deodorant-naturel-vs-antiperspirant",
    title: "Déodorant ou anti-transpirant : lequel choisir ?",
    excerpt: "Comparer les formats, actifs et tolérances cutanées pour une protection efficace sans irritation.",
    category: "Hygiène",
    readTime: "4 min",
    date: "2026-04-05",
    tags: ["déodorant", "transpiration", "sels d'aluminium"],
  },
  {
    slug: "hygiene-intime-guide",
    title: "Hygiène intime : les bons réflexes",
    excerpt: "pH, produits adaptés, fréquence — tout ce qu'il faut savoir pour préserver l'équilibre naturel.",
    category: "Hygiène",
    readTime: "5 min",
    date: "2026-03-25",
    tags: ["hygiène intime", "pH", "soin quotidien"],
  },
  {
    slug: "soins-bucco-dentaires",
    title: "Soins bucco-dentaires : au-delà du brossage",
    excerpt: "Fil dentaire, bain de bouche, grattoir de langue… compléter sa routine pour une bouche saine.",
    category: "Hygiène",
    readTime: "4 min",
    date: "2026-03-10",
    tags: ["dents", "brossage", "fil dentaire"],
  },

  // ── BÉBÉ ────────────────────────────────────────────────
  {
    slug: "choisir-lingettes-bebe",
    title: "Comment choisir des lingettes pour bébé",
    excerpt: "Critères à regarder : composition, parfum, épaisseur et tolérance cutanée du nourrisson.",
    category: "Bébé",
    readTime: "4 min",
    date: "2026-05-10",
    tags: ["lingettes", "nourrisson", "peau bébé"],
  },
  {
    slug: "soins-peau-bebe-0-3-mois",
    title: "Soins de la peau du bébé de 0 à 3 mois",
    excerpt: "La peau du nouveau-né est fragile et perméable. Quels produits privilégier et lesquels éviter absolument.",
    category: "Bébé",
    readTime: "5 min",
    date: "2026-04-30",
    tags: ["nouveau-né", "dermatite", "change"],
  },
  {
    slug: "erytheme-fessier-prevenir-soigner",
    title: "Érythème fessier : prévenir et soigner efficacement",
    excerpt: "Les bons gestes au change, les crèmes barrières et quand consulter un pédiatre.",
    category: "Bébé",
    readTime: "4 min",
    date: "2026-04-12",
    tags: ["érythème", "change", "zinc"],
  },
  {
    slug: "dentition-bebe-conseils",
    title: "Dentition du bébé : soulager les douleurs",
    excerpt: "Gels, anneaux de dentition, massages des gencives — solutions sans médicament pour accompagner l'éruption dentaire.",
    category: "Bébé",
    readTime: "4 min",
    date: "2026-03-28",
    tags: ["dentition", "douleur", "nourrisson"],
  },

  // ── SAISONNALITÉ ─────────────────────────────────────────
  {
    slug: "allergies-printemps-conseils",
    title: "Allergies saisonnières : se préparer avant le printemps",
    excerpt: "Comprendre le calendrier pollinique, les mesures barrières et les produits de confort disponibles en parapharmacie.",
    category: "Saisonnalité",
    readTime: "5 min",
    date: "2026-03-01",
    tags: ["allergie", "pollen", "rhinite"],
  },
  {
    slug: "immunite-automne-hiver",
    title: "Booster son immunité à l'approche de l'hiver",
    excerpt: "Vitamine D, zinc, probiotiques : tour d'horizon des micronutriments à privilégier en prévention.",
    category: "Saisonnalité",
    readTime: "6 min",
    date: "2026-02-15",
    tags: ["immunité", "vitamine D", "zinc"],
  },
  {
    slug: "peau-hiver-proteger",
    title: "Peau en hiver : protéger contre le froid et le vent",
    excerpt: "Textures plus riches, barrière cutanée renforcée, baume lèvres — la routine hiver expliquée.",
    category: "Saisonnalité",
    readTime: "5 min",
    date: "2026-01-20",
    tags: ["hiver", "peau sèche", "froid"],
  },

  // ── BIEN-ÊTRE ────────────────────────────────────────────
  {
    slug: "guide-complements",
    title: "Guide d'achat : compléments alimentaires",
    excerpt: "Comprendre les mentions légales et choisir un complément adapté à vos besoins réels.",
    category: "Bien-être",
    readTime: "7 min",
    date: "2026-04-28",
    tags: ["compléments", "vitamine", "minéraux"],
  },
  {
    slug: "stress-solutions-naturelles",
    title: "Stress et fatigue : les réponses de la parapharmacie",
    excerpt: "Magnésium, ashwagandha, mélatonine… ce que l'on peut attendre de ces actifs selon les études disponibles.",
    category: "Bien-être",
    readTime: "6 min",
    date: "2026-04-14",
    tags: ["stress", "magnésium", "sommeil"],
  },
  {
    slug: "sport-recuperation-soins",
    title: "Sport et récupération : les produits qui font la différence",
    excerpt: "Crèmes chauffantes, compresses, bandes de maintien et compléments protéinés — guide pour les sportifs.",
    category: "Bien-être",
    readTime: "5 min",
    date: "2026-03-15",
    tags: ["sport", "récupération", "muscles"],
  },
  {
    slug: "cheveux-chute-solutions",
    title: "Chute de cheveux : comprendre et agir",
    excerpt: "Différencier chute saisonnière, effluvium et alopécie pour choisir la bonne approche : shampoings, compléments, soins locaux.",
    category: "Bien-être",
    readTime: "7 min",
    date: "2026-02-28",
    tags: ["cheveux", "chute", "kératine"],
  },
];
