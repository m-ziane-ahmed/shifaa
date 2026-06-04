import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/orders/cod — Liste commandes COD à confirmer
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const wilaya  = searchParams.get("wilaya");
  const status  = searchParams.get("status") ?? "pending";
  const page    = Number(searchParams.get("page") ?? 1);
  const limit   = Number(searchParams.get("limit") ?? 20);

  let query = supabase
    .from("orders")
    .select("id, guest_name, guest_phone, wilaya, commune, total, status, cod_confirmed, cod_attempts, created_at, order_items(name, quantity)", { count: "exact" })
    .eq("payment", "cod")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status === "pending")   query = query.in("status", ["pending", "cod_pending_confirmation"]);
  if (status === "confirmed") query = query.eq("cod_confirmed", true);
  if (status === "refused")   query = query.eq("status", "refused");
  if (wilaya) query = query.eq("wilaya", wilaya);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    orders: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  });
}

// POST /api/admin/orders/cod — Confirmation/refus en masse
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, order_ids, agent_name, reason } = body;

  if (!action || !Array.isArray(order_ids) || order_ids.length === 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (const orderId of order_ids) {
    try {
      if (action === "confirm") {
        const { data } = await supabase.rpc("confirm_cod_order", {
          p_order_id: orderId,
          p_agent_name: agent_name ?? "admin",
        });
        results.push({ id: orderId, success: (data as { success?: boolean })?.success ?? false });

      } else if (action === "refuse") {
        const { data } = await supabase.rpc("refuse_cod_order", {
          p_order_id: orderId,
          p_reason: reason ?? "Refus client",
        });
        results.push({ id: orderId, success: (data as { success?: boolean })?.success ?? false });

      } else {
        results.push({ id: orderId, success: false, error: "Action inconnue" });
      }
    } catch (e) {
      results.push({ id: orderId, success: false, error: String(e) });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed    = results.filter((r) => !r.success).length;

  // Log audit global
  await supabase.from("audit_logs").insert({
    table_name: "orders",
    record_id: order_ids.join(","),
    action: "UPDATE",
    new_values: { action, count: succeeded },
    details: `COD batch ${action}: ${succeeded} réussies, ${failed} échouées`,
  });

  return NextResponse.json({ results, succeeded, failed });
}
