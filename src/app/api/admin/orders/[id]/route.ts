import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/orders/[id] — Détail commande
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*),
      profiles(name, phone, role, loyalty_points),
      deliveries(
        *,
        delivery_partners(name, code, tracking_url)
      ),
      payments(*),
      invoices(id, invoice_number, pdf_url, issue_date, total_ttc)
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// PATCH /api/admin/orders/[id] — Mise à jour statut + actions
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, ...data } = body;
  const supabase = createAdminClient();

  // Actions spécifiques
  if (action === "confirm_cod") {
    const { data: result, error } = await supabase
      .rpc("confirm_cod_order", {
        p_order_id: id,
        p_agent_name: data.agent_name ?? "admin",
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(result);
  }

  if (action === "refuse_cod") {
    const { data: result, error } = await supabase
      .rpc("refuse_cod_order", {
        p_order_id: id,
        p_reason: data.reason ?? "Refus client",
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(result);
  }

  if (action === "create_invoice") {
    const { data: result, error } = await supabase
      .rpc("create_invoice_for_order", { p_order_id: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(result);
  }

  if (action === "assign_delivery") {
    const { partner_id, tracking_number } = data;
    const { error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        order_id: id,
        partner_id,
        tracking_number: tracking_number ?? null,
        status: "created",
      });
    if (deliveryError) return NextResponse.json({ error: deliveryError.message }, { status: 500 });

    await supabase.from("orders").update({
      delivery_partner_id: partner_id,
      tracking_number: tracking_number ?? null,
      status: "shipped",
      shipped_at: new Date().toISOString(),
    }).eq("id", id);

    // Log audit
    await supabase.from("audit_logs").insert({
      table_name: "orders",
      record_id: id,
      action: "UPDATE",
      new_values: { status: "shipped", partner_id, tracking_number },
      details: "Affectation livreur partenaire",
    });

    return NextResponse.json({ success: true });
  }

  // Mise à jour générique du statut
  if (data.status) {
    const updates: Record<string, unknown> = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };

    if (data.status === "delivered") updates.delivered_at = new Date().toISOString();
    if (data.status === "shipped")   updates.shipped_at   = new Date().toISOString();

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log audit
    await supabase.from("audit_logs").insert({
      table_name: "orders",
      record_id: id,
      action: "UPDATE",
      new_values: updates,
      details: `Statut mis à jour → ${data.status}`,
    });

    return NextResponse.json({ success: true, status: data.status });
  }

  return NextResponse.json({ error: "Action ou données invalides" }, { status: 400 });
}
