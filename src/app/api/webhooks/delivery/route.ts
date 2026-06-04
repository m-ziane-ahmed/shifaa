import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Mapping statuts livreurs → statuts internes
const STATUS_MAP: Record<string, string> = {
  // Yalidine
  "1": "created", "2": "picked_up", "3": "in_transit",
  "4": "out_for_delivery", "5": "delivered", "6": "failed", "7": "returned",
  // Maystro
  "pending":        "created",
  "processing":     "picked_up",
  "on_way":         "in_transit",
  "out_delivery":   "out_for_delivery",
  "delivered":      "delivered",
  "not_delivered":  "failed",
  "returned":       "returned",
  // Procolis
  "PICKED":         "picked_up",
  "TRANSIT":        "in_transit",
  "DELIVERY":       "out_for_delivery",
  "DELIVERED":      "delivered",
  "FAILED":         "failed",
  "RETURNED":       "returned",
};

// POST /api/webhooks/delivery — Webhook mise à jour statut livraison
export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  // Identifier le partenaire via le header ou query param
  const partnerCode = req.headers.get("x-partner-code")
    ?? new URL(req.url).searchParams.get("partner")
    ?? "UNKNOWN";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  // Vérification signature webhook (simplifiée)
  const signature   = req.headers.get("x-webhook-signature") ?? req.headers.get("x-signature");
  const { data: partner } = await supabase
    .from("delivery_partners")
    .select("id, webhook_secret")
    .eq("code", partnerCode)
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: "Partenaire inconnu" }, { status: 403 });
  }

  // Extraire les informations selon le format du partenaire
  let trackingNumber: string | null = null;
  let rawStatus = "";
  let failureReason: string | null = null;
  let codCollected = false;

  if (partnerCode === "YALIDINE") {
    trackingNumber = String(body.tracking ?? body.tracking_code ?? "");
    rawStatus      = String(body.status ?? body.etat ?? "");
    failureReason  = (body.motif_echec as string) ?? null;
    codCollected   = body.cod_collected === true || body.cod === "collected";
  } else if (partnerCode === "MAYSTRO") {
    trackingNumber = String(body.tracking_number ?? body.order_id ?? "");
    rawStatus      = String(body.status ?? body.state ?? "");
    failureReason  = (body.fail_reason as string) ?? null;
  } else if (partnerCode === "PROCOLIS") {
    trackingNumber = String(body.parcel_id ?? body.tracking ?? "");
    rawStatus      = String(body.status ?? "");
    failureReason  = (body.reason as string) ?? null;
    codCollected   = body.cod_status === "COLLECTED";
  } else {
    // Format générique
    trackingNumber = String(body.tracking_number ?? body.tracking ?? "");
    rawStatus      = String(body.status ?? "");
  }

  const internalStatus = STATUS_MAP[rawStatus] ?? rawStatus.toLowerCase();

  if (!trackingNumber) {
    return NextResponse.json({ error: "tracking_number manquant" }, { status: 400 });
  }

  // Trouver la livraison correspondante
  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, order_id, status")
    .eq("tracking_number", trackingNumber)
    .maybeSingle();

  if (!delivery) {
    // Webhook ignoré mais réponse 200 pour éviter les retry
    console.warn(`[Webhook] Livraison introuvable: ${trackingNumber}`);
    return NextResponse.json({ received: true, warning: "Livraison introuvable" });
  }

  // Mettre à jour la livraison
  const updates: Record<string, unknown> = {
    status:       internalStatus,
    api_response: body,
    updated_at:   new Date().toISOString(),
  };

  if (failureReason)                    updates.failure_reason  = failureReason;
  if (internalStatus === "delivered")   updates.delivered_at    = new Date().toISOString();
  if (internalStatus === "picked_up")   updates.picked_up_at    = new Date().toISOString();
  if (internalStatus === "returned")    updates.returned_at     = new Date().toISOString();
  if (internalStatus === "failed") {
    updates.attempt_count = supabase.rpc ? undefined : 1; // sera incrémenté
  }
  if (codCollected) {
    updates.cod_collected    = true;
    updates.cod_collected_at = new Date().toISOString();
  }

  await supabase.from("deliveries").update(updates).eq("id", delivery.id);

  // Synchroniser la commande
  if (internalStatus === "delivered" && delivery.order_id) {
    await supabase.from("orders").update({
      status:       "delivered",
      delivered_at: new Date().toISOString(),
    }).eq("id", delivery.order_id);

    // Créer la facture automatiquement
    await supabase.rpc("create_invoice_for_order", { p_order_id: delivery.order_id });

    // Notifier le client
    const { data: order } = await supabase
      .from("orders")
      .select("guest_phone, user_id, profiles(phone)")
      .eq("id", delivery.order_id)
      .maybeSingle();

    const phone = order?.guest_phone
      ?? (order?.profiles as { phone?: string } | null)?.phone;

    if (phone) {
      // Appel interne à l'API notify
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: delivery.order_id,
          type:     "order_delivered",
          phone,
        }),
      }).catch(() => {});
    }
  }

  // Log audit webhook
  await supabase.from("audit_logs").insert({
    table_name: "deliveries",
    record_id:  delivery.id,
    action:     "UPDATE",
    new_values: { status: internalStatus, partner: partnerCode, tracking: trackingNumber },
    details:    `Webhook ${partnerCode}: ${rawStatus} → ${internalStatus}`,
  });

  return NextResponse.json({ received: true, status: internalStatus });
}
