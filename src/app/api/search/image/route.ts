import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const CATEGORY_MAP: Record<string, string> = {
  "visage": "visage-peau",
  "crème": "visage-peau",
  "sérum": "visage-peau",
  "masque": "visage-peau",
  "nettoyant": "visage-peau",
  "corps": "corps-hygiene",
  "gel douche": "corps-hygiene",
  "savon": "corps-hygiene",
  "déodorant": "corps-hygiene",
  "shampoing": "cheveux",
  "cheveux": "cheveux",
  "capillaire": "cheveux",
  "bébé": "bebe-maternite",
  "maternité": "bebe-maternite",
  "vitamine": "complements",
  "complément": "complements",
  "gélule": "complements",
  "comprimé": "complements",
  "bio": "bio-naturel",
  "naturel": "bio-naturel",
  "thermomètre": "dispositifs",
  "tensiomètre": "dispositifs",
  "bien-être": "bien-etre",
  "massage": "bien-etre",
};

function extractCategory(description: string): string | null {
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return null;
}

function extractSearchTerms(description: string): string[] {
  const terms: string[] = [];
  const words = description.toLowerCase().split(/[\s,\.]+/);
  const stopWords = new Set(["un", "une", "des", "le", "la", "les", "de", "du", "avec", "pour", "sur", "dans", "est", "qui", "que", "ce", "se", "sa", "son"]);
  return terms.concat(words.filter((w) => w.length > 3 && !stopWords.has(w))).slice(0, 5);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Image manquante" }, { status: 400 });
    }

    // Vérification taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image trop volumineuse (max 5MB)" }, { status: 400 });
    }

    // Convertir en base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif") || "image/jpeg";

    // Analyser l'image avec Claude Vision
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Tu es un expert en parapharmacie. Analyse cette image et identifie :
1. Le type de produit parapharmaceutique (crème, shampoing, complément, etc.)
2. La catégorie principale (visage/peau, corps/hygiène, cheveux, bébé, compléments, bien-être, dispositifs, bio/naturel)
3. 3 mots-clés de recherche pertinents en français
4. La couleur dominante du packaging si visible

Réponds en JSON uniquement, sans balises markdown :
{"type": "...", "category": "...", "keywords": ["...", "...", "..."], "color": "..."}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    let analysis: { type?: string; category?: string; keywords?: string[]; color?: string } = {};

    try {
      analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      // Fallback si JSON invalide
      analysis = { keywords: extractSearchTerms(text) };
    }

    // Déterminer la catégorie
    const detectedCategory =
      analysis.category
        ? CATEGORY_MAP[analysis.category.toLowerCase()] ?? extractCategory(analysis.category)
        : analysis.type
          ? extractCategory(analysis.type)
          : null;

    // Construire la requête de recherche
    const searchTerms = [
      analysis.type ?? "",
      ...(analysis.keywords ?? []),
    ].filter(Boolean).join(" ");

    // Chercher dans la base
    const supabase = createAdminClient();
    let results: Record<string, unknown>[] = [];

    if (searchTerms.length > 2) {
      // Full-text search
      const { data: ftsData } = await supabase.rpc("fuzzy_search_products", {
        query_text: searchTerms,
        p_limit: 12,
        p_threshold: 0.1,
      });
      results = ftsData ?? [];
    }

    // Filtrer par catégorie si détectée
    if (detectedCategory && results.length > 0) {
      const filtered = results.filter((r) => r.category === detectedCategory);
      if (filtered.length >= 3) results = filtered;
    }

    // Fallback : produits de la catégorie détectée
    if (results.length === 0 && detectedCategory) {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, brand, category, price, compare_at_price, images, rating, review_count, stock, is_new, is_best_seller, short_description")
        .eq("is_active", true)
        .eq("category", detectedCategory)
        .order("is_best_seller", { ascending: false })
        .limit(12);
      results = data ?? [];
    }

    const mappedResults = results.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      image: ((p.images as string[]) ?? [])[0] ?? `/images/products/${p.category}/01.jpg`,
      rating: Number(p.rating),
      inStock: (p.stock as number) > 0,
    }));

    return NextResponse.json({
      ok: true,
      analysis: {
        type: analysis.type,
        category: detectedCategory,
        keywords: analysis.keywords,
        searchQuery: searchTerms,
      },
      results: mappedResults,
      total: mappedResults.length,
    });
  } catch (err) {
    console.error("[search/image]", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse de l'image" }, { status: 500 });
  }
}
