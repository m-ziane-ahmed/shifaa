import { NextResponse } from "next/server";
import { createResetToken, findUserByEmail } from "@/lib/auth-store";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/mail";
import { SITE } from "@/lib/site";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "E-mail requis." }, { status: 400 });
  }

  const user = findUserByEmail(email);
  const message =
    "Si un compte existe avec cet e-mail, vous recevrez un lien de réinitialisation.";

  if (user) {
    const tokenRecord = createResetToken(user.id, user.email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/compte/reinitialiser-mot-de-passe?token=${tokenRecord.token}`;

    let emailSent = false;
    if (isSmtpConfigured()) {
      try {
        const result = await sendPasswordResetEmail(user.email, resetUrl);
        emailSent = result.sent;
      } catch (err) {
        console.error("[Shifaa] Échec envoi e-mail reset :", err);
      }
    }

    if (!emailSent) {
      console.info("[Shifaa] E-mail de réinitialisation (fallback console) →", user.email);
      console.info("[Shifaa] Lien :", resetUrl);
    }

    return NextResponse.json({
      ok: true,
      message,
      ...(process.env.NODE_ENV !== "production" &&
        !emailSent && { devResetUrl: resetUrl }),
      contactEmail: SITE.email,
    });
  }

  return NextResponse.json({ ok: true, message });
}
