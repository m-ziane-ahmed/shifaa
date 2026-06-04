import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface FraudFactors {
  new_customer: boolean;
  high_order_value: boolean;
  multiple_orders_same_day: boolean;
  prev_refusals: number;
  blacklisted: boolean;
  suspicious_address: boolean;
  no_phone: boolean;
  high_risk_wilaya: boolean;
}

// Wilayas avec taux de refus COD élevé (configurable)
const HIGH_RISK_WILAYAS = ["11", "01", "08", "33", "37"];

async function calculateFraudScore(
  supabase: ReturnType<typeof createAdminClient>,
  order: {
    id: string;
    total: number;
    payment: string;
    wilaya: string;
    user_id: string | null;
    guest_phone: string | null;
    created_at: string;
  }
): Promise<{ score: number; risk_level: string; factors: FraudFactors }> {
  let score = 0;
  const factors: FraudFactors = {
    new_customer:              false,
    high_order_value:          false,
    multiple_orders_same_day:  false,
    prev_refusals:             0,
    blacklisted:               false,
    suspicious_address:        false,
    no_phone:                  false,
    high_risk_wilaya:          false,
  };

  // 1. Nouveau client (pas d'historique) → +20
  if (!order.user_id) {
    factors.new_customer = true;
    score += 20;
  }

  // 2. Commande élevée COD > 10 000 DZD → +15
  if (order.payment === "cod" && order.total > 10000) {
    factors.high_order_value = true;
    score += 15;
  }

  // 3. Plusieurs commandes le même jour depuis le même téléphone → +25
  if (order.guest_phone) {
    const today = new Date(order.created_at).toISOString().split("T")[0];
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("guest_phone", order.guest_phone)
      .gte("created_at", today)
      .neq("id", order.id);
    if ((count ?? 0) >= 2) {
      factors.multiple_orders_same_day = true;
      score += 25;
    }
  }

  // 4. Historique de refus → +10 par refus (max +40)
  if (order.guest_phone) {
    const { count: refusals } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("guest_phone", order.guest_phone)
      .eq("status", "refused");
    factors.prev_refusals = refusals ?? 0;
    score += Math.min((refusals ?? 0) * 10, 40);
  }

  // 5. Numéro de téléphone manquant → +10
  if (!order.guest_phone) {
    factors.no_phone = true;
    score += 10;
  }

  // 6. Wilaya à risque → +10
  if (HIGH_RISK_WILAYAS.includes(order.wilaya)) {
    factors.high_risk_wilaya = true;
    score += 10;
  }

  // 7. Client blacklisté → +50
  if (order.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_blacklisted")
      .eq("id", order.user_id)
      .maybeSingle();
    if (profile?.is_blacklisted) {
      factors.blacklisted = true;
      score += 50;
    }
  }

  const finalScore = Math.min(score, 100);
  const risk_level =
    finalScore >= 70 ? "critical" :
    finalScore >= 50 ? "high" :
    finalScore >= 30 ? "medium" : "low";

  return { score: finalScore, risk_level, factors };
}

// POST /api/admin/fraud/score — Calculer score fraude d'une commande
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id } = body;
  if (!order_id) return NextResponse.json({ error: "order_id requis" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, total, payment, wilaya, user_id, guest_phone, created_at")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const { score, risk_level, factors } = await calculateFraudScore(supabase, order);

  // Sauvegarder le score
  const { data: fraudRecord, error } = await supabase
    .from("fraud_scores")
    .upsert({
      order_id,
      user_id:      order.user_id ?? null,
      phone_number: order.guest_phone ?? null,
      score,
      risk_level,
      factors,
      prev_refusals: factors.prev_refusals,
    }, { onConflict: "order_id" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Action automatique si critique
  if (risk_level === "critical") {
    await supabase.from("audit_logs").insert({
      table_name: "fraud_scores",
      record_id:  fraudRecord.id,
      action:     "INSERT",
      new_values: { score, risk_level, order_id },
      details:    "Alerte fraude critique — revue manuelle requise",
    });
  }

  return NextResponse.json({ score, risk_level, factors, fraud_id: fraudRecord.id });
}

// GET /api/admin/fraud — Liste scores fraude
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const riskLevel = searchParams.get("risk_level");
  const page      = Number(searchParams.get("page") ?? 1);
  const limit     = Number(searchParams.get("limit") ?? 20);

  let query = supabase
    .from("fraud_scores")
    .select("*, orders(id, total, payment, wilaya, guest_name, status)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (riskLevel) query = query.eq("risk_level", riskLevel);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ scores: data ?? [], total: count ?? 0, page });
}
