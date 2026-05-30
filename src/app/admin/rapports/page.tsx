import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rapports | Admin Shifaa" };

export default async function AdminRapports() {
  const supabase = createAdminClient();

  const [topProducts, topWilayas, revenueByMonth, ordersByStatus] = await Promise.all([
    // Top 10 produits les plus commandés
    supabase
      .from("order_items")
      .select("name, brand, quantity, price")
      .order("quantity", { ascending: false })
      .limit(10),

    // CA par wilaya
    supabase
      .from("orders")
      .select("wilaya, total")
      .neq("status", "cancelled"),

    // CA par mois (6 derniers mois)
    supabase
      .from("orders")
      .select("total, created_at")
      .neq("status", "cancelled")
      .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),

    // Commandes par statut
    supabase
      .from("orders")
      .select("status"),
  ]);

  // Calcul CA par wilaya
  const wilayaMap: Record<string, number> = {};
  for (const o of topWilayas.data ?? []) {
    wilayaMap[o.wilaya] = (wilayaMap[o.wilaya] ?? 0) + o.total;
  }
  const topWilayasData = Object.entries(wilayaMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // CA par mois
  const monthMap: Record<string, number> = {};
  for (const o of revenueByMonth.data ?? []) {
    const month = new Date(o.created_at).toLocaleDateString("fr-DZ", { month: "short", year: "2-digit" });
    monthMap[month] = (monthMap[month] ?? 0) + o.total;
  }

  // Statuts
  const statusMap: Record<string, number> = {};
  for (const o of ordersByStatus.data ?? []) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  }

  const totalCA = Object.values(wilayaMap).reduce((a, b) => a + b, 0);
  const maxWilayaCA = Math.max(...topWilayasData.map(([, v]) => v), 1);

  const STATUS_LABELS: Record<string, string> = {
    pending: "En attente", confirmed: "Confirmées",
    shipped: "Expédiées", delivered: "Livrées", cancelled: "Annulées",
  };
  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-400", confirmed: "bg-blue-400",
    shipped: "bg-purple-400", delivered: "bg-green-500", cancelled: "bg-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Rapports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Répartition commandes par statut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Répartition des commandes</h2>
          <div className="space-y-3">
            {Object.entries(statusMap).map(([status, count]) => {
              const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{STATUS_LABELS[status] ?? status}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[status] ?? "bg-gray-400"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(statusMap).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Aucune commande pour l&apos;instant</p>
            )}
          </div>
        </div>

        {/* Top wilayas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Top 10 wilayas — CA ({formatDZD(totalCA)})</h2>
          <div className="space-y-2">
            {topWilayasData.map(([wilaya, ca]) => (
              <div key={wilaya}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{wilaya}</span>
                  <span className="font-medium">{formatDZD(ca)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#18534F] rounded-full"
                    style={{ width: `${Math.round((ca / maxWilayaCA) * 100)}%` }} />
                </div>
              </div>
            ))}
            {topWilayasData.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Aucune donnée</p>
            )}
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Top produits commandés</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Produit</th>
                <th className="px-4 py-2 text-right">Qté vendue</th>
                <th className="px-4 py-2 text-right">CA généré</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(topProducts.data ?? []).map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{p.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{formatDZD(p.price * p.quantity)}</td>
                </tr>
              ))}
              {(topProducts.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucune vente enregistrée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CA par mois */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">CA mensuel (6 derniers mois)</h2>
          {Object.keys(monthMap).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(monthMap).map(([month, ca]) => {
                const maxCA = Math.max(...Object.values(monthMap));
                return (
                  <div key={month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{month}</span>
                      <span className="font-medium">{formatDZD(ca)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#18534F] rounded-full"
                        style={{ width: `${Math.round((ca / maxCA) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
