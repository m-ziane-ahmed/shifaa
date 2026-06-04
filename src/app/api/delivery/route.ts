import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/delivery/fee — Calcul frais livraison
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wilaya       = searchParams.get("wilaya");
  const mode         = searchParams.get("mode") ?? "home";
  const orderTotal   = Number(searchParams.get("total") ?? 0);

  if (!wilaya) {
    return NextResponse.json({ error: "wilaya requis" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("calc_delivery_fee", {
      p_wilaya_code:  wilaya,
      p_delivery_mode: mode,
      p_order_total:  orderTotal,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
