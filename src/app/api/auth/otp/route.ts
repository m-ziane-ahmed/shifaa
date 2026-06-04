import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS       = 3;
const RESEND_COOLDOWN    = 60; // secondes

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function detectOperator(phone: string): "djezzy" | "ooredoo" | "mobilis" | "unknown" {
  // Préfixes opérateurs algériens
  const clean = phone.replace(/\D/g, "").replace(/^213/, "0");
  if (clean.startsWith("07"))  return "djezzy";
  if (clean.startsWith("05"))  return "ooredoo";
  if (clean.startsWith("06"))  return "mobilis";
  return "unknown";
}

async function sendSMS(phone: string, message: string): Promise<{ success: boolean; ref?: string }> {
  // Intégration passerelle SMS algérienne (ex: SMSInteractif, SendSMS.dz)
  // En production, remplacer par l'API réelle
  const gateway = process.env.SMS_GATEWAY_URL;
  const apiKey  = process.env.SMS_API_KEY;

  if (!gateway || !apiKey) {
    // Mode développement : simuler l'envoi
    console.log(`[SMS DEV] → ${phone}: ${message}`);
    return { success: true, ref: `DEV-${Date.now()}` };
  }

  try {
    const res = await fetch(gateway, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ to: phone, message, sender: "SHIFAA" }),
    });
    const data = await res.json();
    return { success: res.ok, ref: data.reference ?? data.id };
  } catch {
    return { success: false };
  }
}

// POST /api/auth/otp — Envoyer un OTP
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, type = "otp_login" } = body;

  if (!phone) return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 });

  // Normaliser le numéro
  const normalized = phone.replace(/\D/g, "").replace(/^0/, "213");
  if (normalized.length < 11) {
    return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Vérifier cooldown (anti-spam)
  const { data: recent } = await supabase
    .from("sms_log")
    .select("created_at")
    .eq("phone_number", normalized)
    .eq("otp_verified", false)
    .gte("created_at", new Date(Date.now() - RESEND_COOLDOWN * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const cooldownLeft = Math.ceil(
      (RESEND_COOLDOWN * 1000 - (Date.now() - new Date(recent.created_at).getTime())) / 1000
    );
    return NextResponse.json({
      error: `Attendez ${cooldownLeft}s avant de renvoyer`,
      retry_after: cooldownLeft,
    }, { status: 429 });
  }

  const otp     = generateOTP();
  const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const operator = detectOperator(phone);

  const message = type === "otp_register"
    ? `Shifaa : Votre code de vérification est ${otp}. Valide ${OTP_EXPIRY_MINUTES} min.`
    : `Shifaa : Code de connexion ${otp}. Valide ${OTP_EXPIRY_MINUTES} min. Ne le partagez pas.`;

  // Envoyer le SMS
  const smsResult = await sendSMS(normalized, message);

  // Logger dans sms_log
  await supabase.from("sms_log").insert({
    phone_number:   normalized,
    message_type:   type,
    message_body:   message,
    operator,
    status:         smsResult.success ? "sent" : "failed",
    gateway_ref:    smsResult.ref ?? null,
    sent_at:        smsResult.success ? new Date().toISOString() : null,
    otp_code:       otp,  // En prod : hasher avec bcrypt
    otp_expires_at: expires.toISOString(),
    otp_attempts:   0,
  });

  if (!smsResult.success) {
    return NextResponse.json({ error: "Échec envoi SMS" }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    expires_at: expires.toISOString(),
    operator,
    // En développement seulement :
    ...(process.env.NODE_ENV === "development" ? { otp_dev: otp } : {}),
  });
}

// PUT /api/auth/otp — Vérifier un OTP
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { phone, otp } = body;

  if (!phone || !otp) {
    return NextResponse.json({ error: "Téléphone et code requis" }, { status: 400 });
  }

  const normalized = phone.replace(/\D/g, "").replace(/^0/, "213");
  const supabase   = createAdminClient();

  // Trouver l'OTP valide
  const { data: smsRecord } = await supabase
    .from("sms_log")
    .select("id, otp_code, otp_expires_at, otp_attempts, otp_verified")
    .eq("phone_number", normalized)
    .eq("otp_verified", false)
    .gt("otp_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!smsRecord) {
    return NextResponse.json({ error: "Code expiré ou inexistant" }, { status: 400 });
  }

  if (smsRecord.otp_attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Trop de tentatives. Demandez un nouveau code." }, { status: 429 });
  }

  // Incrémenter le compteur
  await supabase.from("sms_log").update({
    otp_attempts: smsRecord.otp_attempts + 1,
  }).eq("id", smsRecord.id);

  if (smsRecord.otp_code !== otp) {
    const remaining = MAX_ATTEMPTS - smsRecord.otp_attempts - 1;
    return NextResponse.json({
      error: "Code incorrect",
      attempts_remaining: remaining,
    }, { status: 400 });
  }

  // OTP correct → marquer comme vérifié
  await supabase.from("sms_log").update({
    otp_verified: true,
    delivered_at: new Date().toISOString(),
  }).eq("id", smsRecord.id);

  return NextResponse.json({ success: true, verified: true, phone: normalized });
}
