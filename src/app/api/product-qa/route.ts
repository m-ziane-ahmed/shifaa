import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ qas: [] });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("product_qa")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "answered")
    .order("created_at", { ascending: false });

  return NextResponse.json({ qas: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { productId, question } = await request.json();
    if (!productId || !question?.trim()) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("product_qa").insert({
      product_id: productId,
      question: question.trim(),
      status: "pending",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
