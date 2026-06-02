import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

// Vérifier que l'utilisateur est admin
async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// ── GET : liste des produits avec pagination ─────────────────────────
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = 20;

  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select("id, slug, name, brand, category, price, cost_price, stock, is_active, status, catalog_score, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,sku.ilike.%${q}%`);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data ?? [], count, page, pageSize });
}

// ── POST : créer un nouveau produit ─────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();

  // Vérifier que le slug est unique
  const { data: existing } = await supabase.from("products").select("id").eq("slug", body.slug).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 400 });

  const { data, error } = await supabase.from("products").insert({
    name: body.name,
    brand: body.brand,
    slug: body.slug,
    sku: body.sku || null,
    category: body.category,
    subcategory: body.subcategory || null,
    short_description: body.short_description,
    description: body.description || null,
    ingredients: body.ingredients || null,
    usage: body.usage || null,
    precautions: body.precautions || null,
    benefits: body.benefits ?? [],
    active_ingredients: body.active_ingredients ?? [],
    price: body.price,
    compare_at_price: body.compare_at_price || null,
    cost_price: body.cost_price || null,
    stock: body.stock ?? 0,
    weight_grams: body.weight_grams || null,
    barcode: body.barcode || null,
    need: body.need || null,
    skin_type: body.skin_type ?? [],
    age_group: body.age_group || null,
    gender: body.gender || null,
    is_new: body.is_new ?? false,
    is_best_seller: body.is_best_seller ?? false,
    is_active: body.status === "published",
    is_bio: body.is_bio ?? false,
    is_vegan: body.is_vegan ?? false,
    is_sans_parfum: body.is_sans_parfum ?? false,
    is_sans_parabene: body.is_sans_parabene ?? false,
    status: body.status ?? "draft",
    meta_title: body.meta_title || null,
    meta_description: body.meta_description || null,
    images: [],
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log audit
  await supabase.from("product_audit_log").insert({
    product_id: data.id,
    user_id: user.id,
    field: "creation",
    new_value: body.name,
  });

  return NextResponse.json({ id: data.id });
}
