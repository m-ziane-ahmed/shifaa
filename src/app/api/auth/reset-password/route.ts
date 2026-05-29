import { NextResponse } from "next/server";
import { consumeResetToken, updateUserPassword } from "@/lib/auth-store";

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token et mot de passe requis." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }
  const record = consumeResetToken(token);
  if (!record) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  }
  await updateUserPassword(record.userId, password);
  return NextResponse.json({ ok: true, message: "Mot de passe mis à jour." });
}
