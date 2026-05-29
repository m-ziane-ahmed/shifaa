import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const mode = searchParams.get("mode") ?? "suggest"; // "suggest" | "search"
  const category = searchParams.get("category") ?? undefined;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createAdminClient();

  try {
    if (mode === "suggest") {
      // Autocomplete rapide — ilike + fts
      const { data, error } = await supabase.rpc("suggest_products", {
        query_text: q,
        p_limit: 6,
      });

      if (error) throw error;

      const results = (data ?? []).map((p: Record<string, unknown>) => ({
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
      }));

      return NextResponse.json({ results });
    }

    // Recherche full-text avec ranking
    const { data, error } = await supabase.rpc("search_products", {
      query_text: q,
      p_category: category ?? null,
      p_limit: 20,
    });

    if (error) throw error;

    const results = (data ?? []).map((p: Record<string, unknown>) => ({
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
      rank: p.rank,
    }));

    return NextResponse.json({ results, total: results.length });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ results: [], error: "Erreur de recherche" }, { status: 500 });
  }
}
