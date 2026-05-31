import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ tickets: [] });

  const admin = createAdminClient();
  const { data } = await admin
    .from("support_tickets")
    .select("*, support_messages(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ tickets: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, subject, message, orderRef, guestEmail, guestName } = body;
    if (!category || !subject || !message) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();

    const { data: ticket, error } = await admin.from("support_tickets").insert({
      user_id: user?.id ?? null,
      guest_email: !user ? guestEmail : null,
      guest_name: !user ? guestName : null,
      order_ref: orderRef ?? null,
      category,
      subject,
      message,
      status: "open",
      priority: "normal",
      channel: "web",
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Premier message
    await admin.from("support_messages").insert({
      ticket_id: ticket.id,
      sender: "client",
      message,
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
