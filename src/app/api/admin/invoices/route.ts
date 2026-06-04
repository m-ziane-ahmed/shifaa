import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/invoices — Liste factures
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const page      = Number(searchParams.get("page") ?? 1);
  const limit     = Number(searchParams.get("limit") ?? 20);
  const q         = searchParams.get("q") ?? "";
  const dateFrom  = searchParams.get("date_from");
  const dateTo    = searchParams.get("date_to");

  let query = supabase
    .from("invoices")
    .select("*, orders(id, status, payment, wilaya)", { count: "exact" })
    .order("issue_date", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (q) query = query.or(`invoice_number.ilike.%${q}%,guest_name.ilike.%${q}%`);
  if (dateFrom) query = query.gte("issue_date", dateFrom);
  if (dateTo)   query = query.lte("issue_date", dateTo);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    invoices: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  });
}

// POST /api/admin/invoices — Créer facture pour une commande
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json({ error: "order_id requis" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("create_invoice_for_order", { p_order_id: order_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
