import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// POST /api/admin/produits/[id]/duplicate
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Vérification admin
  const supabaseUser = await createServerSupabaseClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data: profile } = await supabaseUser.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createAdminClient();

  // Récupérer le produit original
  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  // Générer un slug unique
  const baseSlug = `${original.slug}-copie`;
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${++attempt}`;
  }

  // Dupliquer sans les champs uniques/auto
  const {
    id: _id,
    created_at: _created,
    updated_at: _updated,
    fts: _fts,
    catalog_score: _score,
    rating: _rating,
    review_count: _rc,
    popularity_score: _pop,
    reorder_rate: _rr,
    satisfaction_rate: _sr,
    stock_reserved: _sr2,
    avg_daily_sales: _ads,
    ...rest
  } = original;

  // Noms clés des colonnes à exclure (elles ont des valeurs issues de l'original)
  void _id; void _created; void _updated; void _fts; void _score;
  void _rating; void _rc; void _pop; void _rr; void _sr; void _sr2; void _ads;

  const { data: copy, error: insertError } = await supabase
    .from("products")
    .insert({
      ...rest,
      slug,
      name:   `${original.name} (Copie)`,
      name_ar: original.name_ar ? `${original.name_ar} (نسخة)` : null,
      sku:    original.sku ? `${original.sku}-COPY` : null,
      status: "draft",
      is_active: false,
      stock:  0,
      rating: 0,
      review_count: 0,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Log audit
  await supabase.from("audit_logs").insert({
    table_name: "products",
    record_id:  copy.id,
    action:     "INSERT",
    new_values: { source_id: id, name: copy.slug },
    details:    `Duplication de ${original.name}`,
  });

  return NextResponse.json({ success: true, id: copy.id, slug: copy.slug });
}
