import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { extractRelation } from "@/lib/supabase-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId        = searchParams.get("order_id");
  const trackingNumber = searchParams.get("tracking_number");

  if (!orderId && !trackingNumber) {
    return NextResponse.json({ error: "order_id ou tracking_number requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("deliveries")
    .select(`
      id, tracking_number, tracking_url, status,
      estimated_delivery, picked_up_at, delivered_at,
      attempt_count, failure_reason, cod_collected,
      delivery_partners(name, code, tracking_url, logo_url),
      orders(id, status, total, payment, wilaya, commune)
    `);

  if (orderId)        query = query.eq("order_id", orderId);
  if (trackingNumber) query = query.eq("tracking_number", trackingNumber);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Livraison introuvable" }, { status: 404 });

  const TIMELINE: Record<string, { label_fr: string; label_ar: string; icon: string; step: number }> = {
    created:          { label_fr: "Commande créée",           label_ar: "تم إنشاء الطلب",        icon: "📋", step: 1 },
    picked_up:        { label_fr: "Récupérée par le livreur",  label_ar: "تم الاستلام من المتجر",  icon: "🏪", step: 2 },
    in_transit:       { label_fr: "En transit",               label_ar: "في الطريق",              icon: "🚚", step: 3 },
    out_for_delivery: { label_fr: "En cours de livraison",    label_ar: "في طريق التسليم",        icon: "🛵", step: 4 },
    delivered:        { label_fr: "Livrée",                   label_ar: "تم التسليم",             icon: "✅", step: 5 },
    failed:           { label_fr: "Tentative échouée",        label_ar: "محاولة فاشلة",           icon: "⚠️", step: 3 },
    returned:         { label_fr: "Retournée",                label_ar: "مُعادة",                 icon: "↩️", step: 3 },
    cancelled:        { label_fr: "Annulée",                  label_ar: "ملغاة",                  icon: "❌", step: 0 },
  };

  const currentStatus = TIMELINE[data.status] ?? { label_fr: data.status, label_ar: data.status, icon: "📦", step: 0 };
  const partner = extractRelation<{ name: string; code: string; tracking_url: string; logo_url: string }>(data.delivery_partners);

  return NextResponse.json({
    tracking: {
      ...data,
      status_info: currentStatus,
      tracking_link: (partner?.tracking_url && data.tracking_number)
        ? partner.tracking_url.replace("{tracking}", data.tracking_number)
        : null,
    },
  });
}
