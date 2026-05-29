import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getLoyaltyPoints } from "@/lib/auth-store";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ points: 0 });
  }
  return NextResponse.json({ points: getLoyaltyPoints(session.userId) });
}
