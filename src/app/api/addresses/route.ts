import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { deleteAddress, getAddresses, saveAddress } from "@/lib/auth-store";
import { getSession } from "@/lib/session";
import type { AddressRecord } from "@/lib/store-types";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return NextResponse.json({ addresses: getAddresses(session.userId) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const body = await request.json();
  const address: AddressRecord = {
    id: body.id ?? uuid(),
    userId: session.userId,
    label: body.label,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    phone: body.phone,
    isDefault: Boolean(body.isDefault),
  };
  saveAddress(address);
  return NextResponse.json({ ok: true, address });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
  deleteAddress(id, session.userId);
  return NextResponse.json({ ok: true });
}
