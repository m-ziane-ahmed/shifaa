import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const flat  = searchParams.get("flat") === "true";

  let query = supabase
    .from("categories_v4")
    .select("id, parent_id, name_fr, name_ar, slug_fr, slug_ar, level, display_order, icon, is_active")
    .order("level").order("display_order");

  if (level !== null) query = query.eq("level", Number(level));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (flat) return NextResponse.json({ categories: data ?? [] });

  const roots = (data ?? []).filter((c) => !c.parent_id);
  const tree  = roots.map((r) => ({
    ...r,
    subcategories: (data ?? []).filter((c) => c.parent_id === r.id),
  }));

  return NextResponse.json({ categories: tree }, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name_fr, slug_fr, parent_id, level, ...rest } = body;

  if (!name_fr || !slug_fr) {
    return NextResponse.json({ error: "name_fr et slug_fr requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Vérifier unicité du slug
  const { data: existing } = await supabase
    .from("categories_v4").select("id").eq("slug_fr", slug_fr).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });

  const { data, error } = await supabase
    .from("categories_v4")
    .insert({ name_fr, slug_fr, parent_id: parent_id || null, level: level ?? (parent_id ? 1 : 0), ...rest })
    .select("id, slug_fr")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, category: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories_v4")
    .update(updates)
    .eq("id", id)
    .select("id, slug_fr")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, category: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories_v4").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
