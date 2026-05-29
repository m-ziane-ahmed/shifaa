import { NextResponse } from "next/server";
import { findOrderById } from "@/lib/auth-store";
import { createPaymentSession, getSatimRedirectUrl } from "@/lib/payment";

export async function POST(request: Request) {
  const { orderId, method } = await request.json();
  if (!orderId || !["cib", "edahabia"].includes(method)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const order = findOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Commande déjà payée." }, { status: 400 });
  }

  const session = createPaymentSession(orderId, method, order.total);
  const redirectUrl = getSatimRedirectUrl(session.token);

  return NextResponse.json({ redirectUrl, token: session.token });
}
