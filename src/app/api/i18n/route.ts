import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/i18n?lang=fr&namespace=orders — Traductions depuis Supabase
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang      = searchParams.get("lang") ?? "fr";
  const namespace = searchParams.get("namespace");

  if (!["fr", "ar"].includes(lang)) {
    return NextResponse.json({ error: "Langue non supportée" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("get_translations", {
      p_lang:      lang,
      p_namespace: namespace ?? null,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { translations: data ?? {} },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

// PUT /api/i18n — Mettre à jour une traduction (admin)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { lang, namespace, key, value } = body;

  if (!lang || !namespace || !key || !value) {
    return NextResponse.json({ error: "lang, namespace, key, value requis" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("translations")
    .upsert({ lang, namespace, key, value, updated_at: new Date().toISOString() },
      { onConflict: "lang,namespace,key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
