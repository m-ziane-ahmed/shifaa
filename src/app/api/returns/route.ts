import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createReturnRequest, getReturns } from "@/lib/auth-store";
import { getSession } from "@/lib/session";
import type { ReturnRequestRecord } from "@/lib/store-types";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return NextResponse.json({ returns: getReturns(session.userId) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const { orderId, reason } = await request.json();
  if (!orderId || !reason) {
    return NextResponse.json({ error: "Commande et motif requis." }, { status: 400 });
  }
  const req: ReturnRequestRecord = {
    id: uuid(),
    userId: session.userId,
    orderId,
    reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  createReturnRequest(req);
  return NextResponse.json({ ok: true, request: req });
}
