import { NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id, name, brand, stock, stock_min, stock_safety, price, is_active")
    .order("name");

  return NextResponse.json({ products: data ?? [] });
}
