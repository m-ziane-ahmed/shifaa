import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Vérifier que la commande appartient à l'utilisateur connecté
  if (user && order.user_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.json({ order });
}
