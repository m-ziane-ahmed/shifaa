import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Mapper snake_case → camelCase pour le front
  const mapped = (orders ?? []).map((o) => ({
    id: o.id,
    userId: o.user_id,
    status: o.status,
    paymentStatus: o.payment_status,
    payment: o.payment,
    total: o.total,
    subtotal: o.subtotal,
    discount: o.discount,
    delivery: o.delivery,
    wilaya: o.wilaya,
    commune: o.commune,
    address: o.address,
    deliveryMode: o.delivery_mode,
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((i: Record<string, unknown>) => ({
      productId: i.product_id,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
  }));

  return NextResponse.json({ orders: mapped });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();

  const isGuest = !user;

  if (isGuest && (!body.guestEmail || !body.guestName || !body.guestPhone)) {
    return NextResponse.json(
      { error: "E-mail, nom et téléphone requis pour une commande invité." },
      { status: 400 }
    );
  }

  const orderId = `SHF-${Date.now()}`;
  const paymentStatus = body.payment === "cod" ? "cod_pending" : "pending";
  const orderStatus = body.payment === "cod" ? "confirmed" : "pending";

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: user?.id ?? null,
    guest_email: isGuest ? body.guestEmail : null,
    guest_name: isGuest ? body.guestName : null,
    guest_phone: isGuest ? body.guestPhone : null,
    subtotal: body.subtotal,
    discount: body.discount ?? 0,
    promo_code: body.promoCode ?? null,
    delivery: body.delivery,
    total: body.total,
    status: orderStatus,
    payment_status: paymentStatus,
    delivery_mode: body.deliveryMode,
    wilaya: body.wilaya,
    commune: body.commune,
    address: body.address,
    payment: body.payment,
  });

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const items = body.items.map((item: {
    productId: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image?: string;
  }) => ({
    order_id: orderId,
    product_id: null,
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    price: item.price,
    quantity: item.quantity,
    image: item.image ?? "",
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (user) {
    const points = Math.floor(body.total / 100);
    if (points > 0) {
      await supabase.rpc("add_loyalty_points", { user_id: user.id, points });
    }
  }

  return NextResponse.json({ ok: true, order: { id: orderId } });
}
