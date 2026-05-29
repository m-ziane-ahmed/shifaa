import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/auth-store";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
    }
    const user = findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.isLoggedIn = true;
    await session.save();
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ error: "Erreur de connexion." }, { status: 500 });
  }
}
