import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des stocks | Admin Shifaa" };

export default async function StocksPage() {
  const supabase = createAdminClient();

  // KPIs stocks
  const [
    { data: products },
    { data: alerts },
    { data: movements },
    { data: warehouses },
  ] = await Promise.all([
    supabase.from("products").select("id, name, brand, stock, stock_min, stock_safety, price, is_active")
      .order("stock", { ascending: true }).limit(20),
    supabase.from("stock_alerts").select("*").eq("is_resolved", false)
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("stock_movements").select("*, products(name)")
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("warehouses").select("id, name, code, is_active"),
  ]);

  // Stats globales
  const { data: stats } = await supabase.from("products").select("stock, price, is_active");
  const totalProducts = stats?.length ?? 0;
  const totalStock = stats?.reduce((s, p) => s + (p.stock ?? 0), 0) ?? 0;
  const stockValue = stats?.reduce((s, p) => s + ((p.stock ?? 0) * (p.price ?? 0)), 0) ?? 0;
  const outOfStock = stats?.filter((p) => (p.stock ?? 0) === 0).length ?? 0;
  const lowStock = stats?.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length ?? 0;
  const criticalAlerts = alerts?.filter((a) => a.alert_type === "critical" || a.alert_type === "out_of_stock").length ?? 0;

  const moveTypeLabel: Record<string, { label: string; color: string }> = {
    entry:      { label: "Entrée",       color: "text-green-600" },
    exit:       { label: "Sortie",       color: "text-red-600" },
    transfer:   { label: "Transfert",    color: "text-blue-600" },
    adjustment: { label: "Ajustement",  color: "text-amber-600" },
    return:     { label: "Retour",      color: "text-purple-600" },
    reserved:   { label: "Réservé",     color: "text-orange-600" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des stocks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi temps réel · Alertes · Mouvements · Entrepôts</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stocks/mouvement" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            + Mouvement de stock
          </Link>
          <Link href="/admin/stocks/inventaire" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            📋 Inventaire
          </Link>
          <Link href="/admin/stocks/transfert" className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
            🔄 Transfert
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 mb-8">
        {[
          { label: "Produits actifs", value: totalProducts.toLocaleString(), icon: "📦", color: "bg-blue-50 border-blue-100" },
          { label: "Unités en stock", value: totalStock.toLocaleString(), icon: "🏭", color: "bg-green-50 border-green-100" },
          { label: "Valeur du stock", value: formatDZD(stockValue), icon: "💰", color: "bg-amber-50 border-amber-100" },
          { label: "Ruptures", value: String(outOfStock), icon: "🚨", color: outOfStock > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100" },
          { label: "Stock faible", value: String(lowStock), icon: "⚠️", color: lowStock > 0 ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-100" },
          { label: "Alertes actives", value: String(criticalAlerts), icon: "🔔", color: criticalAlerts > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border p-4 ${kpi.color}`}>
            <p className="text-2xl mb-1">{kpi.icon}</p>
            <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Produits critique de stock ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stocks critiques</h2>
            <Link href="/admin/stocks/produits" className="text-xs text-shifaa-green hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(products ?? []).slice(0, 10).map((p) => {
              const pct = p.stock_min ? Math.min(100, Math.round(((p.stock ?? 0) / p.stock_min) * 100)) : 0;
              const status = (p.stock ?? 0) === 0 ? { label: "Rupture", cls: "bg-red-100 text-red-700" }
                : (p.stock ?? 0) <= (p.stock_safety ?? 5) ? { label: "Critique", cls: "bg-orange-100 text-orange-700" }
                : (p.stock ?? 0) <= (p.stock_min ?? 10) ? { label: "Faible", cls: "bg-amber-100 text-amber-700" }
                : { label: "OK", cls: "bg-green-100 text-green-700" };
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${(p.stock ?? 0) === 0 ? "text-red-600" : (p.stock ?? 0) <= 10 ? "text-amber-600" : "text-gray-800"}`}>
                      {p.stock ?? 0} unités
                    </p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${(p.stock ?? 0) === 0 ? "bg-red-500" : pct < 30 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>{status.label}</span>
                  <Link href={`/admin/stocks/produit/${p.id}`} className="text-xs text-gray-400 hover:text-shifaa-green shrink-0">→</Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Alertes et entrepôts ── */}
        <div className="space-y-5">
          {/* Alertes */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">🔔 Alertes actives</h2>
              <Link href="/admin/stocks/alertes" className="text-xs text-shifaa-green hover:underline">Voir tout →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(alerts ?? []).length === 0 ? (
                <p className="px-5 py-6 text-sm text-center text-gray-400">Aucune alerte active ✅</p>
              ) : (alerts ?? []).slice(0, 5).map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${a.alert_type === "out_of_stock" ? "bg-red-100 text-red-700" :
                        a.alert_type === "critical" ? "bg-orange-100 text-orange-700" :
                        a.alert_type === "low_stock" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"}`}>
                      {a.alert_type === "out_of_stock" ? "🚨 Rupture" :
                       a.alert_type === "critical" ? "⚠️ Critique" :
                       a.alert_type === "low_stock" ? "📉 Faible" : "📦 Excédent"}
                    </span>
                    <span className="text-xs text-gray-400">{a.current_stock} unités</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entrepôts */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">🏭 Entrepôts</h2>
              <Link href="/admin/stocks/entrepots" className="text-xs text-shifaa-green hover:underline">Gérer →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(warehouses ?? []).map((w) => (
                <div key={w.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{w.name}</p>
                    <p className="text-xs text-gray-400">{w.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {w.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
              {(warehouses ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-center text-gray-400">Aucun entrepôt configuré</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Derniers mouvements */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Derniers mouvements de stock</h2>
          <Link href="/admin/stocks/mouvements" className="text-xs text-shifaa-green hover:underline">Historique complet →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Produit", "Type", "Quantité", "Avant", "Après", "Référence"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(movements ?? []).map((m) => {
                const mt = moveTypeLabel[m.movement_type] ?? { label: m.movement_type, color: "text-gray-600" };
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[160px] truncate">
                      {(m.products as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${mt.color}`}>{mt.label}</span>
                    </td>
                    <td className={`px-4 py-2.5 font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">{m.qty_before}</td>
                    <td className="px-4 py-2.5 text-gray-800">{m.qty_after}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{m.reference ?? "—"}</td>
                  </tr>
                );
              })}
              {(movements ?? []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun mouvement enregistré</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
