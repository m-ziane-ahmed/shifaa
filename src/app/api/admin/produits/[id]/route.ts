import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// ── GET : détail d'un produit ────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product: data });
}

// ── PATCH : mettre à jour un produit ────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  // Vérifier l'unicité du slug si changé
  const { data: existing } = await supabase
    .from("products").select("id").eq("slug", body.slug).neq("id", id).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ce slug est déjà utilisé par un autre produit" }, { status: 400 });

  // Récupérer les valeurs actuelles pour l'audit
  const { data: before } = await supabase.from("products").select("name, price, stock, status").eq("id", id).single();

  const { error } = await supabase.from("products").update({
    name:              body.name,
    brand:             body.brand,
    slug:              body.slug,
    sku:               body.sku || null,
    category:          body.category,
    subcategory:       body.subcategory || null,
    short_description: body.short_description,
    description:       body.description || null,
    ingredients:       body.ingredients || null,
    usage:             body.usage || null,
    precautions:       body.precautions || null,
    benefits:          body.benefits ?? [],
    active_ingredients:body.active_ingredients ?? [],
    price:             body.price,
    compare_at_price:  body.compare_at_price || null,
    cost_price:        body.cost_price || null,
    stock:             body.stock ?? 0,
    weight_grams:      body.weight_grams || null,
    barcode:           body.barcode || null,
    need:              body.need || null,
    skin_type:         body.skin_type ?? [],
    age_group:         body.age_group || null,
    gender:            body.gender || null,
    is_new:            body.is_new ?? false,
    is_best_seller:    body.is_best_seller ?? false,
    is_active:         body.status === "published",
    is_bio:            body.is_bio ?? false,
    is_vegan:          body.is_vegan ?? false,
    is_sans_parfum:    body.is_sans_parfum ?? false,
    is_sans_parabene:  body.is_sans_parabene ?? false,
    status:            body.status ?? "draft",
    meta_title:        body.meta_title || null,
    meta_description:  body.meta_description || null,
    supplier_id:       body.supplier_id || null,
    updated_at:        new Date().toISOString(),
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit trail — enregistrer les changements significatifs
  const auditEntries = [];
  if (before?.name !== body.name) auditEntries.push({ product_id: id, user_id: user.id, field: "name", old_value: before?.name, new_value: body.name });
  if (before?.price !== body.price) auditEntries.push({ product_id: id, user_id: user.id, field: "price", old_value: String(before?.price), new_value: String(body.price) });
  if (before?.stock !== body.stock) auditEntries.push({ product_id: id, user_id: user.id, field: "stock", old_value: String(before?.stock), new_value: String(body.stock) });
  if (before?.status !== body.status) auditEntries.push({ product_id: id, user_id: user.id, field: "status", old_value: before?.status, new_value: body.status });

  if (auditEntries.length > 0) {
    await supabase.from("product_audit_log").insert(auditEntries);
  }

  return NextResponse.json({ ok: true });
}

// ── DELETE : archiver un produit ─────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Archiver plutôt que supprimer définitivement
  const { error } = await supabase.from("products")
    .update({ status: "archived", is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("product_audit_log").insert({
    product_id: id, user_id: user.id, field: "status", old_value: "published", new_value: "archived",
  });

  return NextResponse.json({ ok: true });
}
