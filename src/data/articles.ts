export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "routine-peau-ete",
    title: "Adapter sa routine peau en été",
    excerpt: "Conseils pratiques pour hydrater et protéger votre peau lors des fortes chaleurs.",
    category: "Peau",
    readTime: "5 min",
    date: "2026-05-15",
  },
  {
    slug: "choisir-lingettes-bebe",
    title: "Comment choisir des lingettes pour bébé",
    excerpt: "Critères à regarder : composition, parfum, épaisseur et tolérance cutanée.",
    category: "Bébé",
    readTime: "4 min",
    date: "2026-05-10",
  },
  {
    slug: "guide-complements",
    title: "Guide d'achat : compléments alimentaires",
    excerpt: "Comprendre les mentions légales et choisir un complément adapté à vos besoins.",
    category: "Bien-être",
    readTime: "7 min",
    date: "2026-04-28",
  },
  {
    slug: "hygiene-mains",
    title: "Hygiène des mains au quotidien",
    excerpt: "Bonnes pratiques sans agresser la peau.",
    category: "Hygiène",
    readTime: "3 min",
    date: "2026-04-20",
  },
];
