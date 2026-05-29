import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { updateStore } from "@/lib/db";

type StockAlert = {
  id: string;
  productId: string;
  email: string;
  createdAt: string;
};

const FILE = "stock-alerts.json";

export async function POST(request: Request) {
  const { productId, email } = await request.json();
  if (!productId || !email) {
    return NextResponse.json({ error: "Champs requis." }, { status: 400 });
  }
  const alert: StockAlert = {
    id: uuid(),
    productId,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  updateStore<StockAlert[]>(FILE, [], (list) => [alert, ...list]);
  console.info("[Shifaa] Alerte stock →", email, productId);
  return NextResponse.json({ ok: true });
}
