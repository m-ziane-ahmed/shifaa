import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/categories — Arborescence complète bilingue
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flat  = searchParams.get("flat") === "true";
  const level = searchParams.get("level");

  const supabase = createAdminClient();

  let query = supabase
    .from("categories_v4")
    .select("id, parent_id, name_fr, name_ar, slug_fr, slug_ar, level, display_order, icon, is_active")
    .eq("is_active", true)
    .order("level")
    .order("display_order");

  if (level !== null) query = query.eq("level", Number(level));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (flat) {
    return NextResponse.json({ categories: data ?? [] });
  }

  // Construire l'arborescence hiérarchique
  const roots = (data ?? []).filter((c) => !c.parent_id);
  const children = (data ?? []).filter((c) => c.parent_id);

  const tree = roots.map((root) => ({
    ...root,
    subcategories: children.filter((c) => c.parent_id === root.id),
  }));

  return NextResponse.json(
    { categories: tree },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
