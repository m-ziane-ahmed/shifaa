import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/brands — Catalogue marques
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 24);
  const category = searchParams.get("category");
  const local = searchParams.get("local");

  // Détail d'une marque avec ses produits
  if (slug) {
    const { data: brand } = await supabase
      .from("brands")
      .select(`
        *,
        brand_categories(
          is_primary,
          categories_v4(id, name_fr, name_ar, slug_fr, slug_ar)
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!brand) return NextResponse.json({ error: "Marque introuvable" }, { status: 404 });

    // Produits de cette marque
    let prodQuery = supabase
      .from("products")
      .select("id, slug, name, name_ar, price, stock, images, rating, review_count, is_new, is_best_seller, category, subcategory", { count: "exact" })
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .eq("status", "published")
      .order("is_best_seller", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) prodQuery = prodQuery.eq("category", category);

    const { data: products, count } = await prodQuery;

    return NextResponse.json({
      brand,
      products: products ?? [],
      total: count ?? 0,
      page,
      pages: Math.ceil((count ?? 0) / limit),
    });
  }

  // Liste toutes les marques
  let query = supabase
    .from("brands")
    .select(`
      id, slug, name, name_ar, logo_url, banner_url,
      short_desc_fr, short_desc_ar,
      is_local, is_featured, is_certified, certification_label,
      product_count, avg_rating, country_origin,
      brand_categories(
        is_primary,
        categories_v4(id, name_fr, name_ar, slug_fr)
      )
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("display_order");

  if (local === "true") query = query.eq("is_local", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ brands: data ?? [] });
}
