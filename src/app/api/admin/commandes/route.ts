import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(name, phone, email)")
    .eq("id", id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const body = await req.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status: body.status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
