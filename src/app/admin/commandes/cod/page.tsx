import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "COD — Confirmation | Admin Shifaa" };

async function confirmCOD(orderId: string, agentName: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.rpc("confirm_cod_order", { p_order_id: orderId, p_agent_name: agentName });
  revalidatePath("/admin/commandes/cod");
}

async function refuseCOD(orderId: string, reason: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.rpc("refuse_cod_order", { p_order_id: orderId, p_reason: reason });
  revalidatePath("/admin/commandes/cod");
}

async function blacklistClient(phone: string, orderId: string) {
  "use server";
  const supabase = createAdminClient();
  // Marquer le client en blacklist
  await supabase.from("profiles").update({ is_blacklisted: true }).eq("phone", phone);
  await supabase.from("orders").update({
    status: "cancelled",
    notes: "Client blacklisté — refus répétés COD",
  }).eq("id", orderId);
  await supabase.from("audit_logs").insert({
    table_name: "profiles",
    record_id: phone,
    action: "UPDATE",
    new_values: { is_blacklisted: true },
    details: `Client blacklisté suite à refus COD sur commande ${orderId}`,
  });
  revalidatePath("/admin/commandes/cod");
}

export default async function CODPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; wilaya?: string }>;
}) {
  const params  = await searchParams;
  const tab     = params.tab ?? "pending";
  const supabase = createAdminClient();

  // Stats COD globales
  const { data: allCOD } = await supabase
    .from("orders")
    .select("status, total, wilaya, cod_confirmed, cod_attempts")
    .eq("payment", "cod");

  const codOrders    = allCOD ?? [];
  const totalCOD     = codOrders.length;
  const confirmed    = codOrders.filter((o) => o.cod_confirmed).length;
  const refused      = codOrders.filter((o) => o.status === "refused").length;
  const pending      = codOrders.filter((o) => ["pending","cod_pending_confirmation"].includes(o.status) && !o.cod_confirmed).length;
  const confirmRate  = totalCOD > 0 ? Math.round((confirmed / totalCOD) * 100) : 0;
  const totalRevenue = codOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);

  // Commandes selon l'onglet actif
  let query = supabase
    .from("orders")
    .select("*, profiles(name, phone, is_blacklisted)")
    .eq("payment", "cod")
    .order("created_at", { ascending: false });

  if (tab === "pending")   query = query.in("status", ["pending", "cod_pending_confirmation"]).eq("cod_confirmed", false);
  if (tab === "confirmed") query = query.eq("cod_confirmed", true).not("status", "in", '("delivered","refused","cancelled")');
  if (tab === "refused")   query = query.in("status", ["refused", "cancelled"]);
  if (tab === "delivered") query = query.eq("status", "delivered");

  if (params.wilaya) query = query.eq("wilaya", params.wilaya);

  const { data: orders } = await query.limit(50);

  // Wilayas avec le plus de refus
  const wilayaRefus: Record<string, number> = {};
  codOrders.filter((o) => o.status === "refused").forEach((o) => {
    wilayaRefus[o.wilaya] = (wilayaRefus[o.wilaya] ?? 0) + 1;
  });
  const topRefusWilaya = Object.entries(wilayaRefus)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/commandes" className="hover:text-shifaa-green">Commandes</Link>
            <span>›</span>
            <span className="text-gray-600 font-medium">Module COD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cash On Delivery</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Confirmation téléphonique · Réconciliation · Blacklist
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/commandes" className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
            ← Toutes commandes
          </Link>
        </div>
      </div>

      {/* KPIs COD */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total COD", value: totalCOD, color: "text-gray-700", bg: "bg-white" },
          { label: "⏳ En attente", value: pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "✅ Confirmées", value: confirmed, color: "text-green-700", bg: "bg-green-50 border-green-100" },
          { label: "❌ Refusées", value: refused, color: "text-red-700", bg: "bg-red-50 border-red-100" },
          { label: "Taux confirmation", value: `${confirmRate}%`, color: confirmRate >= 70 ? "text-green-700" : "text-red-700", bg: "bg-blue-50 border-blue-100" },
        ].map((k) => (
          <div key={k.label} className={`rounded-2xl border p-4 ${k.bg}`}>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-4">

        {/* Liste principale */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4 gap-0.5">
            {[
              { id: "pending",   label: "⏳ En attente",  count: pending },
              { id: "confirmed", label: "✅ Confirmées",  count: confirmed },
              { id: "refused",   label: "❌ Refusées",   count: refused },
              { id: "delivered", label: "📦 Livrées COD", count: null },
            ].map((t) => (
              <Link key={t.id} href={`?tab=${t.id}`}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition -mb-px
                  ${tab === t.id
                    ? "bg-white border border-b-white border-gray-200 text-shifaa-green"
                    : "text-gray-500 hover:text-gray-700"}`}>
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${tab === t.id ? "bg-shifaa-green text-white" : "bg-gray-100 text-gray-600"}`}>
                    {t.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Table commandes */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {(orders ?? []).length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm text-gray-400">Aucune commande dans cet onglet</p>
                </div>
              ) : (orders ?? []).map((o) => {
                const profile = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles as { name?: string; phone?: string; is_blacklisted?: boolean } | null;
                const phone   = o.guest_phone ?? profile?.phone ?? "—";
                const name    = o.guest_name  ?? profile?.name  ?? "Client";
                const isBlacklisted = profile?.is_blacklisted ?? false;
                return (
                  <div key={o.id} className={`p-4 hover:bg-gray-50 transition ${isBlacklisted ? "bg-red-50/30" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/admin/commandes/show?id=${o.id}`}
                            className="font-mono text-xs text-shifaa-green hover:underline truncate max-w-[140px]">
                            {o.id.slice(0, 16)}…
                          </Link>
                          {isBlacklisted && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                              🚫 BLACKLIST
                            </span>
                          )}
                          {o.cod_attempts > 0 && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                              {o.cod_attempts} tentative{o.cod_attempts > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <a href={`tel:${phone}`}
                            className="text-sm text-blue-600 hover:underline font-mono">
                            📞 {phone}
                          </a>
                          <span className="text-xs text-gray-400">{o.wilaya}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(o.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-gray-900">{formatDZD(o.total)}</p>
                        <p className="text-xs text-gray-400">{o.item_count ?? "—"} article(s)</p>
                      </div>
                    </div>

                    {/* Actions — seulement pour les commandes en attente */}
                    {tab === "pending" && !isBlacklisted && (
                      <div className="flex gap-2 mt-3">
                        {/* Confirmer */}
                        <form action={async () => {
                          "use server";
                          await confirmCOD(o.id, "admin");
                        }} className="flex-1">
                          <button type="submit"
                            className="w-full py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">
                            ✅ Confirmer
                          </button>
                        </form>
                        {/* Refuser */}
                        <form action={async () => {
                          "use server";
                          await refuseCOD(o.id, "Refus client à la confirmation");
                        }} className="flex-1">
                          <button type="submit"
                            className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                            ❌ Refuser
                          </button>
                        </form>
                        {/* SMS relance */}
                        <a href={`/api/admin/notify`}
                          className="px-3 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition">
                          📲 SMS
                        </a>
                      </div>
                    )}

                    {/* Blacklist — pour les refus répétés */}
                    {tab === "refused" && phone !== "—" && (
                      <div className="flex gap-2 mt-2">
                        <form action={async () => {
                          "use server";
                          await blacklistClient(phone, o.id);
                        }}>
                          <button type="submit"
                            className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                            onClick={(e) => {
                              if (!confirm(`Blacklister ${phone} ? Cette action est irréversible.`)) e.preventDefault();
                            }}>
                            🚫 Blacklister ce client
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panneau latéral — stats */}
        <div className="space-y-4">
          {/* CA COD livré */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">💰 CA COD Livré</h3>
            <p className="text-2xl font-bold text-green-700">{formatDZD(totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Sur {codOrders.filter((o) => o.status === "delivered").length} livraisons
            </p>
          </div>

          {/* Top wilayas refus */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">📍 Top Wilayas Refus</h3>
            {topRefusWilaya.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun refus enregistré</p>
            ) : (
              <div className="space-y-2">
                {topRefusWilaya.map(([wilaya, count]) => (
                  <Link key={wilaya} href={`?tab=refused&wilaya=${wilaya}`}
                    className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-1 transition">
                    <span className="text-sm text-gray-700">{wilaya}</span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {count} refus
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Guide confirmation */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-800 mb-2">📋 Procédure COD</h3>
            <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside">
              <li>Appeler le client sous 2h</li>
              <li>Vérifier l'adresse wilaya</li>
              <li>Confirmer ou refuser</li>
              <li>SMS automatique envoyé</li>
              <li>Affecter un livreur</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
