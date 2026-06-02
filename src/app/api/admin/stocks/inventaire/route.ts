import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

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
  const { name, warehouse_id, notes, lines } = body;

  const supabase = createAdminClient();

  // Créer la session d'inventaire
  const { data: session, error } = await supabase
    .from("inventory_sessions")
    .insert({
      name,
      warehouse_id: warehouse_id || null,
      notes: notes || null,
      status: "in_progress",
      started_at: new Date().toISOString(),
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insérer les lignes d'inventaire
  if (lines && lines.length > 0) {
    const linesData = lines.map((l: { product_id: string; qty_theoretical: number; qty_counted: string }) => ({
      session_id: session.id,
      product_id: l.product_id,
      qty_theoretical: l.qty_theoretical,
      qty_counted: l.qty_counted !== "" ? Number(l.qty_counted) : null,
    }));
    await supabase.from("inventory_lines").insert(linesData);
  }

  return NextResponse.json({ id: session.id });
}

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("inventory_sessions")
    .select("*, warehouses(name)")
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ sessions: data ?? [] });
}
