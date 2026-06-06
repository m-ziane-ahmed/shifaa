import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Livreurs Partenaires | Admin Shifaa" };

const PARTNER_LOGOS: Record<string, string> = {
  YALIDINE: "🟡", MAYSTRO: "🔵", PROCOLIS: "🟣",
  "AP EMS": "🟢", APIS: "🔴", ZR: "⚪",
};

export default async function AdminLivreurs() {
  const supabase = createAdminClient();

  const { data: partners } = await supabase
    .from("delivery_partners")
    .select("*")
    .order("priority");

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("status, partner_id");

  // Stats par partenaire
  const stats: Record<string, { total: number; delivered: number; failed: number; in_transit: number }> = {};
  for (const d of deliveries ?? []) {
    if (!stats[d.partner_id]) stats[d.partner_id] = { total: 0, delivered: 0, failed: 0, in_transit: 0 };
    stats[d.partner_id].total++;
    if (d.status === "delivered") stats[d.partner_id].delivered++;
    if (d.status === "failed")    stats[d.partner_id].failed++;
    if (["in_transit", "out_for_delivery", "picked_up"].includes(d.status)) stats[d.partner_id].in_transit++;
  }

  const totalDeliveries = (deliveries ?? []).length;
  const totalDelivered  = (deliveries ?? []).filter((d) => d.status === "delivered").length;
  const rate = totalDeliveries > 0 ? Math.round((totalDelivered / totalDeliveries) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livreurs Partenaires</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {(partners ?? []).length} partenaires · {totalDeliveries} livraisons · {rate}% taux de succès
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stocks/mouvements" className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
            📋 Historique livraisons
          </Link>
          <Link href="/admin/wilayas" className="px-3 py-2 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark">
            🗺 Tarifs par wilaya
          </Link>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Partenaires actifs", value: (partners ?? []).filter((p) => p.is_active).length, color: "text-green-700", bg: "bg-green-50 border-green-100" },
          { label: "Livraisons totales", value: totalDeliveries, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
          { label: "Livrées avec succès", value: totalDelivered, color: "text-shifaa-green", bg: "bg-shifaa-green/5 border-shifaa-green/20" },
          { label: "Taux de succès", value: `${rate}%`, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
        ].map((k) => (
          <div key={k.label} className={`rounded-2xl border p-4 ${k.bg}`}>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Grille partenaires */}
      <div className="grid gap-4 lg:grid-cols-2">
        {(partners ?? []).map((p) => {
          const s = stats[p.id] ?? { total: 0, delivered: 0, failed: 0, in_transit: 0 };
          const partnerRate = s.total > 0 ? Math.round((s.delivered / s.total) * 100) : 0;
          const logo = PARTNER_LOGOS[p.code] ?? "📦";
          return (
            <div key={p.id} className={`bg-white rounded-2xl border border-gray-200 p-5 ${!p.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{logo}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-gray-400">{p.code}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.is_active ? "Actif" : "Inactif"}
                      </span>
                      {p.supports_cod && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full">COD</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${partnerRate >= 80 ? "text-green-600" : partnerRate >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    {partnerRate}%
                  </p>
                  <p className="text-[10px] text-gray-400">taux succès</p>
                </div>
              </div>

              {/* Stats livraisons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Total", value: s.total, color: "text-gray-700" },
                  { label: "En cours", value: s.in_transit, color: "text-blue-600" },
                  { label: "Livrées", value: s.delivered, color: "text-green-600" },
                  { label: "Échouées", value: s.failed, color: "text-red-600" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center bg-gray-50 rounded-xl p-2">
                    <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tarifs */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "🏠 Domicile", value: p.fee_home },
                  { label: "📦 Relais", value: p.fee_relay },
                  { label: "📍 Express", value: p.fee_express },
                ].map((fee) => (
                  <div key={fee.label} className="text-center bg-blue-50 rounded-lg p-2">
                    <p className="text-xs font-semibold text-blue-700">
                      {fee.value != null ? `${fee.value} DZD` : "—"}
                    </p>
                    <p className="text-[10px] text-blue-400">{fee.label}</p>
                  </div>
                ))}
              </div>

              {/* Couverture + Tracking */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Priorité : {p.priority ?? "—"}</span>
                {p.tracking_url && (
                  <a href={p.tracking_url.replace("{tracking}", "TEST")} target="_blank"
                    className="text-shifaa-green hover:underline">
                    ↗ Tester le suivi
                  </a>
                )}
                {p.api_url && (
                  <span className="text-green-500">✓ API connectée</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(partners ?? []).length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🚚</p>
          <p className="text-gray-500 font-medium mb-1">Aucun livreur partenaire configuré</p>
          <p className="text-sm text-gray-400">Les partenaires sont configurés via la table delivery_partners dans Supabase</p>
        </div>
      )}
    </div>
  );
}
