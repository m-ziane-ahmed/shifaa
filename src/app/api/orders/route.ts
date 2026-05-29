import { NextResponse } from "next/server";
import { addLoyaltyPoints, createOrder, getOrders } from "@/lib/auth-store";
import { getSession } from "@/lib/session";
import type { OrderRecord } from "@/lib/store-types";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return NextResponse.json({ orders: getOrders(session.userId) });
}

export async function POST(request: Request) {
  const session = await getSession();
  const body = await request.json();

  const isGuest = !session.isLoggedIn;
  if (isGuest && (!body.guestEmail || !body.guestName || !body.guestPhone)) {
    return NextResponse.json(
      { error: "E-mail, nom et téléphone requis pour une commande invité." },
      { status: 400 }
    );
  }

  const payment = body.payment as OrderRecord["payment"];
  const paymentStatus: OrderRecord["paymentStatus"] =
    payment === "cod" ? "cod_pending" : "pending";

  const order: OrderRecord = {
    id: `SHF-${Date.now()}`,
    userId: session.userId ?? "guest",
    guestEmail: isGuest ? body.guestEmail : undefined,
    guestName: isGuest ? body.guestName : undefined,
    guestPhone: isGuest ? body.guestPhone : undefined,
    items: body.items,
    subtotal: body.subtotal,
    discount: body.discount ?? 0,
    promoCode: body.promoCode,
    delivery: body.delivery,
    total: body.total,
    status: payment === "cod" ? "confirmed" : "pending",
    paymentStatus,
    deliveryMode: body.deliveryMode,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    payment,
    createdAt: new Date().toISOString(),
  };

  createOrder(order);

  if (session.userId && session.userId !== "guest") {
    const points = Math.floor(order.total / 100);
    addLoyaltyPoints(session.userId, points);
  }

  return NextResponse.json({ ok: true, order });
}
