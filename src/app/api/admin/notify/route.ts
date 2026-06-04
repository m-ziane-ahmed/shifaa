import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const SMS_TEMPLATES: Record<string, (vars: Record<string, string>) => string> = {
  order_confirm: (v) =>
    `Shifaa : Votre commande ${v.order_id} est confirmée. Total : ${v.total} DZD. Merci pour votre confiance !`,
  order_shipped: (v) =>
    `Shifaa : Votre commande ${v.order_id} est expédiée via ${v.partner}. Suivi : ${v.tracking ?? "bientôt disponible"}.`,
  order_delivered: (v) =>
    `Shifaa : Votre commande ${v.order_id} a été livrée. Satisfait(e) ? Notez-nous sur shifaa.dz ⭐`,
  cod_confirm: (v) =>
    `Shifaa : Votre commande ${v.order_id} (${v.total} DZD) attend confirmation. Répondez OUI pour confirmer ou NON pour annuler.`,
  cod_reminder: (v) =>
    `Shifaa : Rappel - Votre commande ${v.order_id} nécessite une confirmation. Appelez-nous au +213 7 70 70 80 90.`,
  cod_refused: (v) =>
    `Shifaa : Commande ${v.order_id} annulée. Pour toute question : contact@shifaa.dz ou +213 7 70 70 80 90.`,
  promo: (v) =>
    `Shifaa : ${v.message} Code promo : ${v.code ?? ""}. Valide jusqu'au ${v.expires ?? ""}. shifaa.dz`,
  loyalty: (v) =>
    `Shifaa : Vous avez ${v.points} points fidélité. Utilisez-les sur votre prochaine commande ! shifaa.dz`,
};

// Templates arabes
const SMS_TEMPLATES_AR: Record<string, (vars: Record<string, string>) => string> = {
  order_confirm: (v) =>
    `شفاء : طلبك ${v.order_id} مؤكد. المجموع: ${v.total} دج. شكراً لثقتك!`,
  order_shipped: (v) =>
    `شفاء : طلبك ${v.order_id} تم شحنه عبر ${v.partner}. رقم التتبع: ${v.tracking ?? "قريباً"}.`,
  order_delivered: (v) =>
    `شفاء : تم تسليم طلبك ${v.order_id} بنجاح. راضٍ؟ قيّمنا على shifaa.dz ⭐`,
  cod_confirm: (v) =>
    `شفاء : طلبك ${v.order_id} (${v.total} دج) ينتظر تأكيدك. أرسل نعم للتأكيد أو لا للإلغاء.`,
  cod_reminder: (v) =>
    `شفاء : تذكير - طلبك ${v.order_id} يحتاج تأكيداً. اتصل بنا: 213770708090+`,
  cod_refused: (v) =>
    `شفاء : تم إلغاء الطلب ${v.order_id}. للاستفسار: contact@shifaa.dz`,
};

// POST /api/admin/notify — Envoyer notification SMS
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, type, phone, lang = "fr", vars = {} } = body;

  if (!type || !phone) {
    return NextResponse.json({ error: "type et phone requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Récupérer les détails commande si order_id fourni
  let orderVars = vars;
  if (order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, status, payment, delivery_partner_id, tracking_number, delivery_partners(name)")
      .eq("id", order_id)
      .maybeSingle();

    if (order) {
      const partner = order.delivery_partners as { name: string } | null;
      orderVars = {
        ...vars,
        order_id,
        total: String(order.total),
        partner: partner?.name ?? "",
        tracking: order.tracking_number ?? "",
      };
    }
  }

  // Obtenir le template
  const templates = lang === "ar" ? SMS_TEMPLATES_AR : SMS_TEMPLATES;
  const templateFn = templates[type];
  if (!templateFn) {
    return NextResponse.json({ error: `Template inconnu: ${type}` }, { status: 400 });
  }

  const message = templateFn(orderVars);

  // Normaliser le téléphone
  const normalizedPhone = phone.replace(/\D/g, "").replace(/^0/, "213");

  // Enregistrer dans sms_log
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

  // Envoyer le SMS (intégration passerelle)
  const gateway = process.env.SMS_GATEWAY_URL;
  const apiKey  = process.env.SMS_API_KEY;
  let sent = false;
  let gatewayRef: string | null = null;

  if (gateway && apiKey) {
    try {
      const res = await fetch(gateway, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ to: normalizedPhone, message, sender: "SHIFAA" }),
      });
      const resData = await res.json();
      sent = res.ok;
      gatewayRef = resData.reference ?? resData.id ?? null;
    } catch {
      sent = false;
    }
  } else {
    // Mode dev : simuler envoi
    console.log(`[SMS DEV] ${type} → ${normalizedPhone}: ${message}`);
    sent = true;
    gatewayRef = `DEV-${Date.now()}`;
  }

  // Mettre à jour le statut dans sms_log
  await supabase
    .from("sms_log")
    .update({
      status:      sent ? "sent" : "failed",
      gateway_ref: gatewayRef,
      sent_at:     sent ? new Date().toISOString() : null,
    })
    .eq("id", smsRecord.id);

  return NextResponse.json({
    success: sent,
    sms_id:  smsRecord.id,
    message: sent ? "SMS envoyé" : "Échec envoi SMS",
    preview: message,
  });
}

// GET /api/admin/notify/history — Historique SMS
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
    .is("otp_code", null)  // Exclure les OTP
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (orderId) query = query.eq("order_id", orderId);
  if (phone)   query = query.eq("phone_number", phone.replace(/\D/g, "").replace(/^0/, "213"));

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sms: data ?? [], total: count ?? 0, page });
}
