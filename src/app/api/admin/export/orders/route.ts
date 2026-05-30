import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, status, payment, payment_status, wilaya, commune, address, subtotal, discount, delivery, total, promo_code, guest_name, guest_phone, guest_email, created_at")
    .order("created_at", { ascending: false });

  const headers = [
    "id", "status", "payment", "payment_status",
    "wilaya", "commune", "address",
    "guest_name", "guest_phone", "guest_email",
    "subtotal", "discount", "delivery", "total",
    "promo_code", "created_at",
  ];

  const csv = toCSV((orders ?? []) as Record<string, unknown>[], headers);
  const filename = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
