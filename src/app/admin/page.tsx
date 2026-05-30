import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord | Admin Shifaa" };

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const { data: stats } = await supabase.rpc("admin_dashboard_stats");

  const s = stats as Record<string, number>;

  const kpis = [
    { label: "Commandes totales", value: s.total_orders, color: "blue" },
    { label: "En attente", value: s.pending_orders, color: "amber", alert: s.pending_orders > 0 },
    { label: "Expédiées", value: s.shipped_orders, color: "green" },
    { label: "CA total", value: formatDZD(s.total_revenue), color: "teal", big: true },
    { label: "CA aujourd'hui", value: formatDZD(s.revenue_today), color: "green" },
    { label: "CA ce mois", value: formatDZD(s.revenue_this_month), color: "blue" },
    { label: "Produits actifs", value: s.total_products, color: "gray" },
    { label: "Rupture de stock", value: s.out_of_stock, color: "red", alert: s.out_of_stock > 0 },
    { label: "Stock faible (≤5)", value: s.low_stock, color: "amber", alert: s.low_stock > 0 },
    { label: "Clients", value: s.total_customers, color: "purple" },
    { label: "Avis en attente", value: s.pending_reviews, color: "amber", alert: s.pending_reviews > 0 },
  ];

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, total, status, payment, wilaya, created_at, guest_name")
    .order("created_at", { ascending: false })
    .limit(10);

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:   { label: "En attente",  color: "bg-amber-100 text-amber-800" },
    confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-800" },
    shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-800" },
    delivered: { label: "Livrée",      color: "bg-green-100 text-green-800" },
    cancelled: { label: "Annulée",     color: "bg-red-100 text-red-800" },
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tableau de bord</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`bg-white rounded-xl border p-4 ${k.alert ? "border-amber-300" : "border-gray-200"}`}
          >
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`font-semibold ${k.big ? "text-xl" : "text-2xl"} text-gray-900`}>
              {k.value}
            </p>
            {k.alert && (
              <p className="text-xs text-amber-600 mt-1">⚠ Attention requise</p>
            )}
          </div>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Commandes récentes</h2>
          <a href="/admin/commandes" className="text-sm text-shifaa-green hover:underline">
            Voir toutes →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">N° commande</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Wilaya</th>
                <th className="px-4 py-3 text-left">Paiement</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(recentOrders ?? []).map((o) => {
                const st = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <a href={`/admin/commandes/${o.id}`} className="hover:text-shifaa-green">
                        {o.id}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{o.guest_name ?? "Client connecté"}</td>
                    <td className="px-4 py-3 text-gray-500">{o.wilaya}</td>
                    <td className="px-4 py-3 uppercase text-xs text-gray-500">{o.payment}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatDZD(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString("fr-DZ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
