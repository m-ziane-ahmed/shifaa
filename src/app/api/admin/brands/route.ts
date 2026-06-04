import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/brands — Liste complète marques
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const { data, error } = await supabase
      .from("brands")
      .select(`
        *,
        brand_categories(
          id, is_primary,
          categories_v4(id, name_fr, name_ar, slug_fr, slug_ar, level, parent_id)
        )
      `)
      .eq("slug", slug)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ brand: data });
  }

  const { data, error } = await supabase
    .from("brands")
    .select(`
      *,
      brand_categories(
        is_primary,
        categories_v4(name_fr, name_ar, slug_fr)
      )
    `)
    .order("display_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brands: data ?? [] });
}

// POST /api/admin/brands — Créer une marque
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { categories, ...brandData } = body;

  if (!brandData.name || !brandData.slug) {
    return NextResponse.json({ error: "name et slug requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: brand, error } = await supabase
    .from("brands")
    .insert(brandData)
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Lier les catégories
  if (Array.isArray(categories) && categories.length > 0) {
    await supabase.from("brand_categories").insert(
      categories.map((c: { category_id: string; is_primary?: boolean }) => ({
        brand_id:    brand.id,
        category_id: c.category_id,
        is_primary:  c.is_primary ?? false,
      }))
    );
  }

  await supabase.from("audit_logs").insert({
    table_name: "brands",
    record_id:  brand.id,
    action:     "INSERT",
    new_values: { name: brandData.name, slug: brandData.slug },
    details:    "Nouvelle marque créée",
  });

  return NextResponse.json({ success: true, brand });
}

// PATCH /api/admin/brands — Mettre à jour une marque
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, categories, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: brand, error } = await supabase
    .from("brands")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, slug, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mettre à jour les catégories si fournies
  if (Array.isArray(categories)) {
    await supabase.from("brand_categories").delete().eq("brand_id", id);
    if (categories.length > 0) {
      await supabase.from("brand_categories").insert(
        categories.map((c: { category_id: string; is_primary?: boolean }) => ({
          brand_id:    id,
          category_id: c.category_id,
          is_primary:  c.is_primary ?? false,
        }))
      );
    }
  }

  await supabase.from("audit_logs").insert({
    table_name: "brands",
    record_id:  id,
    action:     "UPDATE",
    new_values: updates,
    details:    "Marque mise à jour",
  });

  return NextResponse.json({ success: true, brand });
}

// DELETE /api/admin/brands?id=xxx — Supprimer une marque
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = createAdminClient();

  // Vérifier s'il y a des produits liés
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({
      error: `Impossible de supprimer : ${count} produit(s) lié(s). Désassociez d'abord les produits.`,
    }, { status: 409 });
  }

  await supabase.from("brand_categories").delete().eq("brand_id", id);
  const { error } = await supabase.from("brands").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    table_name: "brands",
    record_id:  id,
    action:     "DELETE",
    details:    "Marque supprimée",
  });

  return NextResponse.json({ success: true });
}
