import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminClient();
  const { data: clients } = await admin
    .from("profiles")
    .select("id, name, phone, loyalty_points, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  const headers = ["id", "name", "phone", "loyalty_points", "created_at"];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const c of clients ?? []) {
    lines.push(headers.map((h) => escape((c as Record<string, unknown>)[h])).join(","));
  }
  const csv = lines.join("\n");
  const filename = `clients-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
