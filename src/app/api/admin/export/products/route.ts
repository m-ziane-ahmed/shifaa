import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : Array.isArray(v) ? (v as unknown[]).join("|") : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("slug, name, brand, category, price, compare_at_price, stock, is_new, is_best_seller, is_active, rating, review_count, need, format, age_group, images")
    .order("category");

  const headers = ["slug", "name", "brand", "category", "price", "compare_at_price", "stock", "is_new", "is_best_seller", "is_active", "rating", "review_count", "need", "format", "age_group", "images"];
  const csv = toCSV((products ?? []) as Record<string, unknown>[], headers);
  const filename = `produits-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
