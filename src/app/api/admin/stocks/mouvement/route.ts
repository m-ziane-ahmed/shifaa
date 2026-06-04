import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { extractRelation } from "@/lib/supabase-helpers";

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
  const {
    product_id, warehouse_id, movement_type,
    quantity, reference, notes, lot_number,
    unit_cost, expiry_date,
  } = body;

  if (!product_id || !warehouse_id || !movement_type || quantity === undefined) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Stock actuel dans l'entrepôt
  const { data: current } = await supabase
    .from("warehouse_stock")
    .select("qty_available")
    .eq("product_id", product_id)
    .eq("warehouse_id", warehouse_id)
    .maybeSingle();

  const qtyBefore = current?.qty_available ?? 0;
  const qtyAfter  = Math.max(0, qtyBefore + Number(quantity));

  // Upsert stock entrepôt
  const whStockData: Record<string, unknown> = {
    product_id, warehouse_id,
    qty_available: qtyAfter,
    updated_at: new Date().toISOString(),
  };
  if (lot_number)   whStockData.lot_number   = lot_number;
  if (expiry_date)  whStockData.expiry_date   = expiry_date;

  await supabase.from("warehouse_stock").upsert(
    whStockData,
    { onConflict: "product_id,warehouse_id,variant_id" }
  );

  // Enregistrer le mouvement de stock
  await supabase.from("stock_movements").insert({
    product_id,
    warehouse_id,
    movement_type,
    quantity:   Number(quantity),
    qty_before: qtyBefore,
    qty_after:  qtyAfter,
    reference:  reference  || null,
    notes:      notes      || null,
    lot_number: lot_number || null,
    unit_cost:  unit_cost  ? Number(unit_cost)  : null,
    user_id:    user.id,
  });

  // Mettre à jour le lot si entrée avec DLC
  if (lot_number && expiry_date && Number(quantity) > 0) {
    await supabase.from("product_lots").upsert({
      product_id,
      lot_number,
      expiry_date,
      qty:        Math.abs(Number(quantity)),
      status:     "active",
    }, { onConflict: "product_id,lot_number" });
  }

  // Recalculer le stock global produit (somme de tous les entrepôts)
  const { data: allStock } = await supabase
    .from("warehouse_stock")
    .select("qty_available")
    .eq("product_id", product_id);

  const total = (allStock ?? []).reduce((s, r) => s + (r.qty_available ?? 0), 0);

  await supabase.from("products").update({
    stock: total,
    ...(Number(quantity) > 0 ? { last_restock_at: new Date().toISOString() } : {}),
  }).eq("id", product_id);

  // Mettre à jour les alertes stock automatiquement
  if (total > 10) {
    await supabase.from("stock_alerts")
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq("product_id", product_id)
      .eq("is_resolved", false);
  }

  return NextResponse.json({
    ok:         true,
    qty_before: qtyBefore,
    qty_after:  qtyAfter,
    total_stock: total,
  });
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  const reference = searchParams.get("reference");
  const type      = searchParams.get("type");
  const grouped   = searchParams.get("grouped") === "true";
  const limit     = Number(searchParams.get("limit") ?? 50);
  const page      = Number(searchParams.get("page") ?? 1);

  const supabase = createAdminClient();

  // Mode groupé par BL (référence)
  if (grouped) {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("reference, movement_type, lot_number, created_at, products(name, brand)")
      .not("reference", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Grouper par référence
    const grouped: Record<string, {
      reference: string;
      movement_type: string;
      lot_number: string | null;
      date: string;
      line_count: number;
      products: string[];
    }> = {};

    for (const m of data ?? []) {
      const ref = m.reference as string;
      if (!grouped[ref]) {
        grouped[ref] = {
          reference:     ref,
          movement_type: m.movement_type,
          lot_number:    m.lot_number ?? null,
          date:          m.created_at,
          line_count:    0,
          products:      [],
        };
      }
      grouped[ref].line_count++;
      const prod = extractRelation<{ name: string }>(m.products);
      if (prod?.name && !grouped[ref].products.includes(prod.name)) {
        grouped[ref].products.push(prod.name);
      }
    }

    return NextResponse.json({
      bls: Object.values(grouped).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });
  }

  // Mode liste classique
  let query = supabase
    .from("stock_movements")
    .select("*, products(name, brand, sku), warehouses(name, code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (productId) query = query.eq("product_id", productId);
  if (reference) query = query.eq("reference", reference);
  if (type)      query = query.eq("movement_type", type);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    movements: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  });
}
