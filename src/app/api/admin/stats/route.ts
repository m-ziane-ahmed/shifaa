import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — Statistiques enrichies V4
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "dashboard";
  const days = Number(searchParams.get("days") ?? 30);

  if (type === "dashboard") {
    const { data, error } = await supabase.rpc("admin_dashboard_stats_v4");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stats: data });
  }

  if (type === "cod_by_wilaya") {
    const { data, error } = await supabase
      .rpc("cod_stats_by_wilaya", { p_days: days });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stats: data ?? [] });
  }

  if (type === "revenue_by_month") {
    const months = Number(searchParams.get("months") ?? 6);
    const { data, error } = await supabase
      .rpc("revenue_by_month", { p_months: months });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stats: data ?? [] });
  }

  if (type === "brands") {
    const { data, error } = await supabase
      .from("brands")
      .select("name, name_ar, product_count, avg_rating, is_local, is_featured")
      .eq("is_active", true)
      .order("product_count", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stats: data ?? [] });
  }

  if (type === "delivery") {
    const { data, error } = await supabase
      .from("deliveries")
      .select("status, delivery_partners(name, code)")
      .gte("created_at", new Date(Date.now() - days * 86400000).toISOString());
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const byPartner: Record<string, { name: string; total: number; delivered: number; failed: number }> = {};
    for (const d of data ?? []) {
      const p = d.delivery_partners as { name: string; code: string } | null;
      const key = p?.code ?? "UNKNOWN";
      if (!byPartner[key]) byPartner[key] = { name: p?.name ?? "—", total: 0, delivered: 0, failed: 0 };
      byPartner[key].total++;
      if (d.status === "delivered") byPartner[key].delivered++;
      if (d.status === "failed")    byPartner[key].failed++;
    }
    return NextResponse.json({ stats: Object.entries(byPartner).map(([code, v]) => ({ code, ...v })) });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}
