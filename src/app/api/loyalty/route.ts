import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// ── GET : récupérer les points et transactions ───────────
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ points: 0, transactions: [] });

  // Assurer que l'entrée existe
  await supabase.from("loyalty_points").upsert(
    { user_id: user.id, points: 0 },
    { onConflict: "user_id", ignoreDuplicates: true }
  );

  const [{ data: pts }, { data: txs }] = await Promise.all([
    supabase.from("loyalty_points").select("points").eq("user_id", user.id).single(),
    supabase.from("loyalty_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    points: pts?.points ?? 0,
    transactions: txs ?? [],
  });
}

// ── POST : ajouter des points (action spécifique) ────────
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { action, reference } = await req.json();

  // Définir les points selon l'action
  const POINTS_MAP: Record<string, { points: number; label: string }> = {
    profile_complete:   { points: 50,  label: "Profil complété" },
    first_review:       { points: 30,  label: "Premier avis laissé" },
    review:             { points: 20,  label: "Avis produit" },
    share:              { points: 10,  label: "Partage réseaux sociaux" },
    referral:           { points: 150, label: "Parrainage ami" },
    birthday:           { points: 100, label: "Bonus anniversaire" },
  };

  const actionDef = POINTS_MAP[action];
  if (!actionDef) return NextResponse.json({ error: "Action inconnue" }, { status: 400 });

  // Vérifier si l'action a déjà été effectuée (éviter les doublons pour certaines actions)
  const UNIQUE_ACTIONS = ["profile_complete", "first_review", "birthday"];
  if (UNIQUE_ACTIONS.includes(action)) {
    const { data: existing } = await supabase
      .from("loyalty_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("reason", actionDef.label)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Action déjà effectuée", alreadyDone: true });
    }
  }

  // Ajouter la transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: user.id,
    points: actionDef.points,
    reason: actionDef.label,
    reference: reference ?? null,
  });

  // Mettre à jour le solde via RPC atomique
  const { error: rpcError } = await supabase.rpc("increment_loyalty_points", {
    p_user_id: user.id,
    p_points: actionDef.points,
  });

  // Fallback si la fonction RPC échoue
  if (rpcError) {
    const { data: current } = await supabase
      .from("loyalty_points")
      .select("points")
      .eq("user_id", user.id)
      .maybeSingle();
    await supabase.from("loyalty_points").upsert({
      user_id: user.id,
      points: (current?.points ?? 0) + actionDef.points,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  // Récupérer le nouveau solde
  const { data: pts } = await supabase
    .from("loyalty_points")
    .select("points")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    success: true,
    pointsEarned: actionDef.points,
    newBalance: pts?.points ?? 0,
  });
}
