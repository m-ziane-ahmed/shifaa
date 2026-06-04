import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/delivery — Liste partenaires + livraisons en cours
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "partners";

  if (type === "partners") {
    const { data, error } = await supabase
      .from("delivery_partners")
      .select("*")
      .order("priority");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ partners: data ?? [] });
  }

  if (type === "active") {
    const page  = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const { data, count, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        delivery_partners(name, code, tracking_url, logo_url),
        orders(id, total, wilaya, guest_name, guest_phone, payment)
      `, { count: "exact" })
      .not("status", "in", '("delivered","cancelled","returned")')
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deliveries: data ?? [], total: count ?? 0, page });
  }

  if (type === "stats") {
    const { data, error } = await supabase
      .from("deliveries")
      .select("status, delivery_partner_id:partner_id, delivery_partners(name, code)");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const stats: Record<string, { name: string; total: number; delivered: number; failed: number; in_transit: number }> = {};
    for (const d of data ?? []) {
      const partner = (d.delivery_partners as { name: string; code: string } | null);
      const key = partner?.code ?? "UNKNOWN";
      if (!stats[key]) stats[key] = { name: partner?.name ?? "Inconnu", total: 0, delivered: 0, failed: 0, in_transit: 0 };
      stats[key].total++;
      if (d.status === "delivered")  stats[key].delivered++;
      if (d.status === "failed")     stats[key].failed++;
      if (["in_transit", "out_for_delivery", "picked_up"].includes(d.status)) stats[key].in_transit++;
    }
    return NextResponse.json({ stats });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}

// POST /api/admin/delivery — Créer une livraison
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, partner_id, tracking_number, estimated_delivery } = body;

  if (!order_id || !partner_id) {
    return NextResponse.json({ error: "order_id et partner_id requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Vérifier la commande
  const { data: order } = await supabase
    .from("orders")
    .select("id, wilaya, commune, address, guest_phone, total, payment")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  // Créer la livraison
  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      order_id,
      partner_id,
      tracking_number: tracking_number ?? null,
      estimated_delivery: estimated_delivery ?? null,
      status: "created",
      wilaya_code: order.wilaya,
      commune: order.commune,
      address: order.address,
      recipient_phone: order.guest_phone,
      cod_amount: order.payment === "cod" ? order.total : null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mettre à jour la commande
  await supabase.from("orders").update({
    delivery_partner_id: partner_id,
    tracking_number: tracking_number ?? null,
    status: "shipped",
    shipped_at: new Date().toISOString(),
  }).eq("id", order_id);

  await supabase.from("audit_logs").insert({
    table_name: "deliveries",
    record_id: delivery.id,
    action: "INSERT",
    new_values: { order_id, partner_id, tracking_number },
    details: "Livraison créée",
  });

  return NextResponse.json({ success: true, delivery_id: delivery.id });
}
