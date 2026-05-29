import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/auth-store";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }
    if (findUserByEmail(email)) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
    }
    const user = await createUser(email, password, name);
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.isLoggedIn = true;
    await session.save();
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'inscription." }, { status: 500 });
  }
}
