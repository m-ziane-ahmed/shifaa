import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// PATCH /api/admin/delivery/[id] — Mise à jour statut livraison + tracking
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, tracking_number, failure_reason, cod_collected } = body;
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status)          updates.status = status;
  if (tracking_number) updates.tracking_number = tracking_number;
  if (failure_reason)  updates.failure_reason = failure_reason;

  if (status === "delivered") {
    updates.delivered_at = new Date().toISOString();
    if (cod_collected) {
      updates.cod_collected    = true;
      updates.cod_collected_at = new Date().toISOString();
    }
  }
  if (status === "picked_up")       updates.picked_up_at  = new Date().toISOString();
  if (status === "failed") {
    // Incrémenter attempt_count
    const { data: current } = await supabase
      .from("deliveries")
      .select("attempt_count")
      .eq("id", id)
      .single();
    updates.attempt_count = ((current?.attempt_count as number) ?? 0) + 1;
    updates.last_attempt_at = new Date().toISOString();
  }
  if (status === "returned")        updates.returned_at   = new Date().toISOString();

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", id)
    .select("order_id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Synchroniser le statut de la commande
  if (status === "delivered" && delivery?.order_id) {
    await supabase.from("orders").update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    }).eq("id", delivery.order_id);
  }

  return NextResponse.json({ success: true, delivery });
}

// GET /api/admin/delivery/[id] — Détail livraison
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("deliveries")
    .select(`
      *,
      delivery_partners(name, code, tracking_url, logo_url, fee_home, fee_relay),
      orders(id, total, wilaya, commune, address, guest_name, guest_phone, payment, status)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Livraison introuvable" }, { status: 404 });
  return NextResponse.json({ delivery: data });
}
