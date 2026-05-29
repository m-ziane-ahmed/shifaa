import { NextResponse } from "next/server";
import { sendContactEmail, isSmtpConfigured } from "@/lib/mail";
import { SITE } from "@/lib/site";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  if (isSmtpConfigured()) {
    try {
      await sendContactEmail({ name, email, subject, message });
      return NextResponse.json({ ok: true, message: "Message envoyé. Nous vous répondrons sous 24–48 h." });
    } catch (err) {
      console.error("[Shifaa] Contact email failed:", err);
      return NextResponse.json({ error: "Échec d'envoi. Réessayez ou appelez-nous." }, { status: 500 });
    }
  }

  console.info("[Shifaa] Contact (console)", { name, email, subject, message });
  return NextResponse.json({
    ok: true,
    message: `Message enregistré. Écrivez-nous aussi à ${SITE.email} si besoin.`,
  });
}
