import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function extractRelation<T>(raw: unknown): T | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as T) ?? null;
  return raw as T;
}

const SMS_TEMPLATES: Record<string, (vars: Record<string, string>) => string> = {
  order_confirm:   (v) => `Shifaa : Votre commande ${v.order_id} est confirmée. Total : ${v.total} DZD. Merci !`,
  order_shipped:   (v) => `Shifaa : Votre commande ${v.order_id} est expédiée via ${v.partner}. Suivi : ${v.tracking ?? "bientôt disponible"}.`,
  order_delivered: (v) => `Shifaa : Votre commande ${v.order_id} a été livrée. Notez-nous sur shifaa.dz ⭐`,
  cod_confirm:     (v) => `Shifaa : Commande ${v.order_id} (${v.total} DZD) en attente. Répondez OUI pour confirmer.`,
  cod_reminder:    (v) => `Shifaa : Rappel commande ${v.order_id}. Appelez-nous : +213 7 70 70 80 90.`,
  cod_refused:     (v) => `Shifaa : Commande ${v.order_id} annulée. Contact : contact@shifaa.dz`,
  promo:           (v) => `Shifaa : ${v.message} Code : ${v.code ?? ""}. Valide jusqu'au ${v.expires ?? ""}. shifaa.dz`,
  loyalty:         (v) => `Shifaa : Vous avez ${v.points} points fidélité. shifaa.dz`,
};

const SMS_TEMPLATES_AR: Record<string, (vars: Record<string, string>) => string> = {
  order_confirm:   (v) => `شفاء : طلبك ${v.order_id} مؤكد. المجموع: ${v.total} دج. شكراً!`,
  order_shipped:   (v) => `شفاء : طلبك ${v.order_id} تم شحنه عبر ${v.partner}. رقم التتبع: ${v.tracking ?? "قريباً"}.`,
  order_delivered: (v) => `شفاء : تم تسليم طلبك ${v.order_id}. قيّمنا على shifaa.dz ⭐`,
  cod_confirm:     (v) => `شفاء : طلبك ${v.order_id} (${v.total} دج) ينتظر تأكيدك. أرسل نعم للتأكيد.`,
  cod_reminder:    (v) => `شفاء : تذكير - طلبك ${v.order_id}. اتصل: 213770708090+`,
  cod_refused:     (v) => `شفاء : تم إلغاء الطلب ${v.order_id}. للاستفسار: contact@shifaa.dz`,
};

// POST /api/admin/notify — Envoyer notification SMS
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, type, phone, lang = "fr", vars = {} } = body;

  if (!type || !phone) {
    return NextResponse.json({ error: "type et phone requis" }, { status: 400 });
  }

  const supabase = createAdminClient();
  let orderVars = vars as Record<string, string>;

  if (order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, status, payment, delivery_partner_id, tracking_number, delivery_partners(name)")
      .eq("id", order_id)
      .maybeSingle();

    if (order) {
      const partner = extractRelation<{ name: string }>(order.delivery_partners);
      orderVars = {
        ...orderVars,
        order_id,
        total:    String(order.total),
        partner:  partner?.name ?? "",
        tracking: order.tracking_number ?? "",
      };
    }
  }

  const templates  = lang === "ar" ? SMS_TEMPLATES_AR : SMS_TEMPLATES;
  const templateFn = templates[type];
  if (!templateFn) {
    return NextResponse.json({ error: `Template inconnu: ${type}` }, { status: 400 });
  }

  const message         = templateFn(orderVars);
  const normalizedPhone = phone.replace(/\D/g, "").replace(/^0/, "213");

  const { data: smsRecord, error: logError } = await supabase
    .from("sms_log")
    .insert({
      phone_number: normalizedPhone,
      message_type: type,
      message_body: message,
      order_id:     order_id ?? null,
      status:       "pending",
    })
    .select("id")
    .single();

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

  const gateway = process.env.SMS_GATEWAY_URL;
  const apiKey  = process.env.SMS_API_KEY;
  let sent = false;
  let gatewayRef: string | null = null;

  if (gateway && apiKey) {
    try {
      const res     = await fetch(gateway, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body:    JSON.stringify({ to: normalizedPhone, message, sender: "SHIFAA" }),
      });
      const resData = await res.json() as { reference?: string; id?: string };
      sent          = res.ok;
      gatewayRef    = resData.reference ?? resData.id ?? null;
    } catch { sent = false; }
  } else {
    console.log(`[SMS DEV] ${type} → ${normalizedPhone}: ${message}`);
    sent       = true;
    gatewayRef = `DEV-${Date.now()}`;
  }

  await supabase.from("sms_log").update({
    status:      sent ? "sent" : "failed",
    gateway_ref: gatewayRef,
    sent_at:     sent ? new Date().toISOString() : null,
  }).eq("id", smsRecord.id);

  return NextResponse.json({
    success: sent,
    sms_id:  smsRecord.id,
    message: sent ? "SMS envoyé" : "Échec envoi SMS",
    preview: message,
  });
}

// GET /api/admin/notify — Historique SMS
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const phone   = searchParams.get("phone");
  const page    = Number(searchParams.get("page") ?? 1);
  const limit   = Number(searchParams.get("limit") ?? 20);

  let query = supabase
    .from("sms_log")
    .select("*", { count: "exact" })
    .is("otp_code", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (orderId) query = query.eq("order_id", orderId);
  if (phone)   query = query.eq("phone_number", phone.replace(/\D/g, "").replace(/^0/, "213"));

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sms: data ?? [], total: count ?? 0, page });
}
