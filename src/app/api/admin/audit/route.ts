import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/audit — Journal d'audit
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);

  const page      = Number(searchParams.get("page") ?? 1);
  const limit     = Number(searchParams.get("limit") ?? 50);
  const table     = searchParams.get("table");
  const action    = searchParams.get("action");
  const recordId  = searchParams.get("record_id");
  const dateFrom  = searchParams.get("date_from");
  const dateTo    = searchParams.get("date_to");

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (table)    query = query.eq("table_name", table);
  if (action)   query = query.eq("action", action);
  if (recordId) query = query.eq("record_id", recordId);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo)   query = query.lte("created_at", dateTo);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    logs: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  });
}

// POST /api/admin/audit — Enregistrer un événement d'audit
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { table_name, record_id, action, old_values, new_values, details, admin_id } = body;

  if (!table_name || !record_id || !action) {
    return NextResponse.json({ error: "table_name, record_id, action requis" }, { status: 400 });
  }

  const supabase  = createAdminClient();
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      table_name,
      record_id: String(record_id),
      action,
      admin_id:   admin_id ?? null,
      old_values: old_values ?? null,
      new_values: new_values ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
      details:    details ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, id: data.id });
}
