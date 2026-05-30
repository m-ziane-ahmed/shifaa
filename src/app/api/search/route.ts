import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type ProductRow = Record<string, unknown>;

function mapResult(p: ProductRow) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    image: ((p.images as string[]) ?? [])[0] ?? `/images/products/${p.category}/01.jpg`,
    rating: Number(p.rating),
    reviewCount: p.review_count,
    inStock: (p.stock as number) > 0,
    isNew: p.is_new,
    isBestSeller: p.is_best_seller,
    shortDescription: p.short_description,
  };
}

function mergeResults(
  primary: ReturnType<typeof mapResult>[],
  secondary: ReturnType<typeof mapResult>[],
  limit: number
) {
  const seen = new Set(primary.map((r) => r.id));
  const merged = [...primary];
  for (const r of secondary) {
    if (!seen.has(r.id as string)) {
      merged.push(r);
      seen.add(r.id as string);
    }
  }
  return merged.slice(0, limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const mode = searchParams.get("mode") ?? "suggest";
  const category = searchParams.get("category") ?? undefined;
  const sessionId = searchParams.get("sid") ?? undefined;

  if (q.length < 2) {
    return NextResponse.json({ results: [], suggestions: [] });
  }

  const supabase = createAdminClient();

  try {
    // ── MODE SUGGEST (autocomplete) ──────────────────────────────
    if (mode === "suggest") {
      const { data: ftsData } = await supabase.rpc("suggest_products", {
        query_text: q,
        p_limit: 6,
      });

      const ftsResults = (ftsData ?? []).map(mapResult);

      // Fuzzy fallback si < 3 résultats FTS
      let finalResults = ftsResults;
      if (ftsResults.length < 3) {
        const { data: fuzzyData } = await supabase.rpc("fuzzy_search_products", {
          query_text: q,
          p_limit: 6,
          p_threshold: 0.15,
        });
        finalResults = mergeResults(ftsResults, (fuzzyData ?? []).map(mapResult), 6);
      }

      // Log analytics (non bloquant)
      void supabase.from("search_logs").insert({
        query: q,
        results: finalResults.length,
        session_id: sessionId ?? null,
      });

      // Suggestion correction si zéro résultat
      let correction: string | null = null;
      if (finalResults.length === 0) {
        const { data: corrData } = await supabase.rpc("suggest_correction", {
          query_text: q,
          p_threshold: 0.2,
        });
        correction = (corrData?.[0]?.suggestion as string) ?? null;
      }

      return NextResponse.json({ results: finalResults, correction });
    }

    // ── MODE SEARCH (page boutique) ──────────────────────────────
    const { data: ftsData } = await supabase.rpc("search_products", {
      query_text: q,
      p_category: category ?? null,
      p_limit: 20,
    });

    const ftsResults = (ftsData ?? []).map(mapResult);

    // Fuzzy fallback si peu de résultats
    let finalResults = ftsResults;
    if (ftsResults.length < 3) {
      const { data: fuzzyData } = await supabase.rpc("fuzzy_search_products", {
        query_text: q,
        p_limit: 20,
        p_threshold: 0.15,
      });
      finalResults = mergeResults(ftsResults, (fuzzyData ?? []).map(mapResult), 20);
    }

    // Suggestion correction + fallback si zéro résultat
    let correction: string | null = null;
    let similar: ReturnType<typeof mapResult>[] = [];

    if (finalResults.length === 0) {
      const { data: corrData } = await supabase.rpc("suggest_correction", {
        query_text: q,
        p_threshold: 0.15,
      });
      correction = (corrData?.[0]?.suggestion as string) ?? null;

      const { data: fallback } = await supabase
        .from("products")
        .select("id, slug, name, brand, category, price, compare_at_price, images, rating, review_count, stock, is_new, is_best_seller, short_description")
        .eq("is_active", true)
        .eq("is_best_seller", true)
        .limit(8);

      similar = (fallback ?? []).map(mapResult);
    }

    // Log
    void supabase.from("search_logs").insert({
      query: q,
      results: finalResults.length,
      session_id: sessionId ?? null,
    });

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      correction,
      similar,
    });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ results: [], error: "Erreur de recherche" }, { status: 500 });
  }
}
