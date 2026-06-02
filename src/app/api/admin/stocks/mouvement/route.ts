import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { product_id, warehouse_id, movement_type, quantity, reference, notes, lot_number, unit_cost } = body;

  if (!product_id || !warehouse_id || !movement_type || quantity === undefined) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Stock actuel
  const { data: current } = await supabase
    .from("warehouse_stock")
    .select("qty_available")
    .eq("product_id", product_id)
    .eq("warehouse_id", warehouse_id)
    .maybeSingle();

  const qtyBefore = current?.qty_available ?? 0;
  const qtyAfter = Math.max(0, qtyBefore + Number(quantity));

  // Upsert stock entrepôt
  await supabase.from("warehouse_stock").upsert({
    product_id, warehouse_id,
    qty_available: qtyAfter,
    updated_at: new Date().toISOString(),
  }, { onConflict: "product_id,warehouse_id,variant_id" });

  // Enregistrer le mouvement
  await supabase.from("stock_movements").insert({
    product_id, warehouse_id, movement_type,
    quantity: Number(quantity),
    qty_before: qtyBefore,
    qty_after: qtyAfter,
    reference: reference || null,
    notes: notes || null,
    lot_number: lot_number || null,
    unit_cost: unit_cost ? Number(unit_cost) : null,
    user_id: user.id,
  });

  // Mettre à jour le stock global produit
  const { data: totalStock } = await supabase
    .from("warehouse_stock")
    .select("qty_available")
    .eq("product_id", product_id);

  const total = (totalStock ?? []).reduce((s, r) => s + (r.qty_available ?? 0), 0);

  await supabase.from("products").update({
    stock: total,
    is_active: total > 0,
    ...(Number(quantity) > 0 ? { last_restock_at: new Date().toISOString() } : {}),
  }).eq("id", product_id);

  return NextResponse.json({ ok: true, qty_before: qtyBefore, qty_after: qtyAfter });
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  const limit = Number(searchParams.get("limit") ?? 50);

  const supabase = createAdminClient();
  let query = supabase.from("stock_movements")
    .select("*, products(name, brand)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ movements: data ?? [] });
}
