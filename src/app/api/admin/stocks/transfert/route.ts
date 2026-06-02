import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { from_warehouse, to_warehouse, notes, lines } = body;
  const admin = createAdminClient();

  // Générer une référence de transfert
  const ref = `TRF-${Date.now()}`;

  // Créer le transfert
  const { data: transfer, error } = await admin.from("stock_transfers").insert({
    from_warehouse, to_warehouse, notes: notes || null,
    status: "in_transit",
    shipped_at: new Date().toISOString(),
    requested_by: user.id,
    reference: ref,
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insérer les lignes
  const linesData = lines.map((l: { product_id: string; qty: number }) => ({
    transfer_id: transfer.id,
    product_id: l.product_id,
    qty_requested: l.qty,
    qty_sent: l.qty,
    qty_received: l.qty,
  }));
  await admin.from("stock_transfer_lines").insert(linesData);

  // Enregistrer les mouvements de stock
  for (const l of lines as Array<{ product_id: string; qty: number }>) {
    // Sortie de l'entrepôt source
    const { data: srcStock } = await admin.from("warehouse_stock")
      .select("qty_available").eq("product_id", l.product_id).eq("warehouse_id", from_warehouse).maybeSingle();
    const srcBefore = srcStock?.qty_available ?? 0;
    const srcAfter = Math.max(0, srcBefore - l.qty);
    await admin.from("warehouse_stock").upsert(
      { product_id: l.product_id, warehouse_id: from_warehouse, qty_available: srcAfter, updated_at: new Date().toISOString() },
      { onConflict: "product_id,warehouse_id,variant_id" }
    );
    await admin.from("stock_movements").insert({
      product_id: l.product_id, warehouse_id: from_warehouse, warehouse_dest: to_warehouse,
      movement_type: "transfer", quantity: -l.qty, qty_before: srcBefore, qty_after: srcAfter,
      reference: ref, user_id: user.id,
    });

    // Entrée dans l'entrepôt destination
    const { data: dstStock } = await admin.from("warehouse_stock")
      .select("qty_available").eq("product_id", l.product_id).eq("warehouse_id", to_warehouse).maybeSingle();
    const dstBefore = dstStock?.qty_available ?? 0;
    const dstAfter = dstBefore + l.qty;
    await admin.from("warehouse_stock").upsert(
      { product_id: l.product_id, warehouse_id: to_warehouse, qty_available: dstAfter, updated_at: new Date().toISOString() },
      { onConflict: "product_id,warehouse_id,variant_id" }
    );
    await admin.from("stock_movements").insert({
      product_id: l.product_id, warehouse_id: to_warehouse, warehouse_dest: from_warehouse,
      movement_type: "transfer", quantity: l.qty, qty_before: dstBefore, qty_after: dstAfter,
      reference: ref, user_id: user.id,
    });
  }

  return NextResponse.json({ id: transfer.id, reference: ref });
}
