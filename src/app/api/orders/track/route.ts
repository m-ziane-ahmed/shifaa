import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/auth-store";

export async function POST(request: Request) {
  const { orderId, email } = await request.json();
  if (!orderId || !email) {
    return NextResponse.json({ error: "Numéro de commande et e-mail requis." }, { status: 400 });
  }
  const order = trackOrder(orderId.trim(), email.trim());
  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable ou e-mail non correspondant." },
      { status: 404 }
    );
  }
  return NextResponse.json({ order });
}
