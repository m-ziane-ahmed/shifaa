import { NextResponse } from "next/server";
import { findOrderById, updateOrder } from "@/lib/auth-store";
import { completePaymentSession, getPaymentSession } from "@/lib/payment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const success = searchParams.get("success") === "1";

  if (!token) {
    return NextResponse.redirect(new URL("/commande/confirmation?error=payment", request.url));
  }

  const session = getPaymentSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/commande/confirmation?error=payment", request.url));
  }

  completePaymentSession(token, success);
  const order = findOrderById(session.orderId);

  if (order) {
    updateOrder(order.id, {
      paymentStatus: success ? "paid" : "failed",
      status: success ? "confirmed" : order.status,
      paymentRef: success ? `SATIM-${token.slice(0, 8)}` : undefined,
    });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (success && order) {
    return NextResponse.redirect(`${base}/commande/confirmation?order=${order.id}`);
  }
  return NextResponse.redirect(`${base}/commande/paiement/simulation?token=${token}&failed=1`);
}
