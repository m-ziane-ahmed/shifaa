import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export async function POST(request: Request) {
  // Vérifier que l'utilisateur est admin
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);

  const admin = createAdminClient();
  let success = 0;
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.slug || !row.name || !row.brand || !row.category || !row.price) {
        errors.push({ row: i + 2, error: "Champs obligatoires manquants (slug, name, brand, category, price)" });
        continue;
      }

      const product = {
        slug: row.slug,
        name: row.name,
        brand: row.brand,
        category: row.category,
        price: parseInt(row.price) || 0,
        compare_at_price: row.compare_at_price ? parseInt(row.compare_at_price) : null,
        stock: parseInt(row.stock) || 0,
        short_description: row.short_description || "",
        description: row.description || "",
        is_new: row.is_new === "true" || row.is_new === "1",
        is_best_seller: row.is_best_seller === "true" || row.is_best_seller === "1",
        is_active: row.is_active !== "false" && row.is_active !== "0",
        need: row.need || null,
        format: row.format || null,
        age_group: row.age_group || null,
        images: row.images ? row.images.split("|").map((s) => s.trim()) : [],
      };

      const { error } = await admin
        .from("products")
        .upsert(product, { onConflict: "slug" });

      if (error) errors.push({ row: i + 2, error: error.message });
      else success++;
    } catch (e) {
      errors.push({ row: i + 2, error: String(e) });
    }
  }

  // Logger l'import
  await admin.from("import_logs").insert({
    type: "products",
    filename: file.name,
    total: rows.length,
    success,
    errors: errors.length,
    error_details: errors.length > 0 ? errors : null,
    created_by: user.id,
  });

  return NextResponse.json({
    ok: true,
    total: rows.length,
    success,
    errors: errors.length,
    errorDetails: errors.slice(0, 10),
  });
}
