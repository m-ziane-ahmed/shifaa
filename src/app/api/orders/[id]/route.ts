import { NextResponse } from "next/server";
import { findOrderById } from "@/lib/auth-store";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = findOrderById(id);
  if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const session = await getSession();
  if (session.userId && order.userId === session.userId) {
    return NextResponse.json({ order });
  }

  return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
}
