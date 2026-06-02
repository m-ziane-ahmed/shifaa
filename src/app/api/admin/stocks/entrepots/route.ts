import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("warehouses").select("*").order("name");
  return NextResponse.json({ warehouses: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createAdminClient();

  // Vérifier que le code est unique
  const { data: existing } = await supabase
    .from("warehouses").select("id").eq("code", body.code).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ce code est déjà utilisé" }, { status: 400 });

  // Si is_default, désactiver les autres
  if (body.is_default) {
    await supabase.from("warehouses").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await supabase.from("warehouses").insert({
    code: body.code,
    name: body.name,
    address: body.address || null,
    wilaya: body.wilaya || null,
    is_active: body.is_active ?? true,
    is_default: body.is_default ?? false,
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
