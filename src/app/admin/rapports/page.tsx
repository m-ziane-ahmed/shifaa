import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rapports | Admin Shifaa" };

export default async function AdminRapports() {
  const supabase = createAdminClient();

  const [topProducts, topWilayas, revenueByMonth, ordersByStatus, stockKpis, categoryData] = await Promise.all([
    supabase.from("order_items").select("name, brand, quantity, price")
      .order("quantity", { ascending: false }).limit(10),
    supabase.from("orders").select("wilaya, total").neq("status", "cancelled"),
    supabase.from("orders").select("total, created_at").neq("status", "cancelled")
      .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("orders").select("status"),
    // RPC exacte — calcul sur TOUS les produits actifs sans limit()
    supabase.rpc("get_stock_kpis"),
    // Répartition par catégorie depuis la DB directement
    supabase.from("products")
      .select("category")
      .eq("is_active", true)
      .not("category", "is", null),
  ]);

  // CA par wilaya
  const wilayaMap: Record<string, number> = {};
  for (const o of topWilayas.data ?? []) {
    wilayaMap[o.wilaya] = (wilayaMap[o.wilaya] ?? 0) + o.total;
  }
  const topWilayasData = Object.entries(wilayaMap).sort(([, a], [, b]) => b - a).slice(0, 10);
  const totalCA = Object.values(wilayaMap).reduce((a, b) => a + b, 0);
  const maxWilayaCA = Math.max(...topWilayasData.map(([, v]) => v), 1);

  // CA par mois
  const monthMap: Record<string, number> = {};
  for (const o of revenueByMonth.data ?? []) {
    const month = new Date(o.created_at).toLocaleDateString("fr-DZ", { month: "short", year: "2-digit" });
    monthMap[month] = (monthMap[month] ?? 0) + o.total;
  }
  const maxMonthCA = Math.max(...Object.values(monthMap), 1);

  // Statuts
  const statusMap: Record<string, number> = {};
  for (const o of ordersByStatus.data ?? []) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  }
  const totalOrders = Object.values(statusMap).reduce((a, b) => a + b, 0);

  // KPIs stock exacts depuis RPC (mêmes chiffres que /admin/stocks)
  const kpis = stockKpis.data as {
    total_products: number; out_of_stock: number; critical: number;
    low_stock: number; ok_stock: number; total_units: number; stock_value: number;
  } | null;
  const stockValue = kpis?.stock_value ?? 0;
  const outOfStock = kpis?.out_of_stock ?? 0;

  // Répartition par catégorie
  const categoryMap: Record<string, number> = {};
  for (const p of categoryData.data ?? []) {
    if (p.category) categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryMap).sort(([, a], [, b]) => b - a).slice(0, 6);
  const maxCat = Math.max(...topCategories.map(([, v]) => v), 1);

  const STATUS_LABELS: Record<string, string> = {
    pending: "En attente", confirmed: "Confirmées",
    shipped: "Expédiées", delivered: "Livrées", cancelled: "Annulées",
  };
  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-400", confirmed: "bg-blue-400",
    shipped: "bg-purple-400", delivered: "bg-green-500", cancelled: "bg-red-400",
  };
  const STATUS_TEXT: Record<string, string> = {
    pending: "text-amber-700", confirmed: "text-blue-700",
    shipped: "text-purple-700", delivered: "text-green-700", cancelled: "text-red-700",
  };

  const topProductsData = topProducts.data ?? [];
  const maxQty = Math.max(...topProductsData.map((p) => p.quantity), 1);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Vue d&apos;ensemble des performances Shifaa</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ⬇ Export commandes
          </a>
          <a href="/api/admin/export/products"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ⬇ Export produits
          </a>
        </div>
      </div>

      {/* KPIs résumés */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100/60 rounded-2xl border border-green-100 p-5">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-2xl font-bold text-green-700 truncate">{formatDZD(totalCA)}</p>
          <p className="text-xs text-green-500 mt-1">CA total</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 rounded-2xl border border-blue-100 p-5">
          <p className="text-2xl mb-1">🛒</p>
          <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
          <p className="text-xs text-blue-500 mt-1">Commandes totales</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl border border-amber-100 p-5">
          <p className="text-2xl mb-1">📦</p>
          <p className="text-2xl font-bold text-amber-700 truncate">{formatDZD(stockValue)}</p>
          <p className="text-xs text-amber-500 mt-1">Valeur du stock</p>
        </div>
        <Link href="/admin/stocks/alertes"
          className="bg-gradient-to-br from-red-50 to-red-100/60 rounded-2xl border border-red-100 p-5 hover:shadow-md transition">
          <p className="text-2xl mb-1">🚨</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          <p className="text-xs text-red-500 mt-1">Ruptures de stock</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* CA mensuel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-5">CA mensuel — 6 derniers mois</h2>
          {Object.keys(monthMap).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(monthMap).map(([month, ca]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0 capitalize">{month}</span>
                  <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-shifaa-green to-emerald-400 rounded-lg transition-all"
                      style={{ width: `${Math.round((ca / maxMonthCA) * 100)}%` }} />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-gray-700 z-10">
                      {formatDZD(ca)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition commandes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Répartition des commandes</h2>
          {Object.keys(statusMap).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune commande</p>
          ) : (
            <>
              {/* Donut simplifié */}
              <div className="flex justify-center mb-5">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-100" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                    <p className="text-[10px] text-gray-400">commandes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {Object.entries(statusMap).map(([status, count]) => {
                  const pct = Math.round((count / totalOrders) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-400"}`} />
                          <span className="text-sm text-gray-600">{STATUS_LABELS[status] ?? status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${STATUS_TEXT[status] ?? "text-gray-600"}`}>{count}</span>
                          <span className="text-xs text-gray-400">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_COLORS[status] ?? "bg-gray-400"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Top produits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Top 10 produits vendus</h2>
          {topProductsData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune vente enregistrée</p>
          ) : (
            <div className="space-y-3">
              {topProductsData.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="mt-0.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-shifaa-green to-emerald-400 rounded-full"
                        style={{ width: `${Math.round((p.quantity / maxQty) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-gray-800">{p.quantity}</p>
                    <p className="text-[10px] text-gray-400">{formatDZD(p.price * p.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top wilayas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Top wilayas</h2>
            <span className="text-xs text-gray-400">Total : {formatDZD(totalCA)}</span>
          </div>
          {topWilayasData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {topWilayasData.map(([wilaya, ca], i) => (
                <div key={wilaya} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-700 font-medium">{wilaya}</span>
                      <span className="text-xs font-bold text-shifaa-green">{formatDZD(ca)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-shifaa-green to-emerald-400 rounded-full"
                        style={{ width: `${Math.round((ca / maxWilayaCA) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Produits par catégorie</h2>
            <Link href="/admin/produits" className="text-xs text-shifaa-green hover:underline">Voir catalogue →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topCategories.map(([cat, count]) => (
              <Link key={cat} href={`/admin/produits?category=${cat}`}
                className="flex flex-col items-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-shifaa-green hover:bg-shifaa-green/5 transition group">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-shifaa-green rounded-full"
                    style={{ width: `${Math.round((count / maxCat) * 100)}%` }} />
                </div>
                <p className="text-lg font-bold text-gray-800 group-hover:text-shifaa-green">{count}</p>
                <p className="text-[10px] text-gray-500 text-center truncate w-full capitalize">{cat.replace(/-/g, " ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
