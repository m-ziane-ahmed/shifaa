import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des stocks | Admin Shifaa" };

export default async function StocksPage() {
  const supabase = createAdminClient();

  const [
    { data: products },
    { data: alerts },
    { data: movements },
    { data: stats },
  ] = await Promise.all([
    supabase.from("products")
      .select("id, name, brand, stock, stock_min, stock_safety, price, is_active, slug")
      .order("stock", { ascending: true }).limit(12),
    supabase.from("stock_alerts")
      .select("*, products(id, name, brand, slug)")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("stock_movements")
      .select("*, products(name, brand)")
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("stock, price, is_active"),
  ]);

  const totalProducts = stats?.length ?? 0;
  const totalStock    = stats?.reduce((s, p) => s + (p.stock ?? 0), 0) ?? 0;
  const stockValue    = stats?.reduce((s, p) => s + ((p.stock ?? 0) * (p.price ?? 0)), 0) ?? 0;
  const outOfStock    = stats?.filter((p) => (p.stock ?? 0) === 0).length ?? 0;
  const lowStock      = stats?.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length ?? 0;
  const okStock       = totalProducts - outOfStock - lowStock;
  const criticalAlerts = alerts?.filter((a) => ["critical","out_of_stock"].includes(a.alert_type)).length ?? 0;
  const totalAlerts   = alerts?.length ?? 0;

  const moveTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    entry:      { label: "Entrée",      color: "text-green-700",  bg: "bg-green-100" },
    exit:       { label: "Sortie",      color: "text-red-700",    bg: "bg-red-100" },
    transfer:   { label: "Transfert",   color: "text-blue-700",   bg: "bg-blue-100" },
    adjustment: { label: "Ajustement", color: "text-amber-700",  bg: "bg-amber-100" },
    return:     { label: "Retour",     color: "text-purple-700", bg: "bg-purple-100" },
    defect:     { label: "Défaut",     color: "text-gray-700",   bg: "bg-gray-100" },
  };

  return (
    <div className="space-y-6">

      {/* ── Header avec actions rapides ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Temps réel · Alertes · Mouvements · Entrepôts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/stocks/mouvement"
            className="flex items-center gap-1.5 px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark shadow-sm transition">
            <span className="text-base">📥</span> Nouveau mouvement
          </Link>
          <Link href="/admin/stocks/inventaire"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition">
            <span>📋</span> Inventaire
          </Link>
          <Link href="/admin/stocks/entrepots"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition">
            <span>🏭</span> Entrepôts
          </Link>
        </div>
      </div>

      {/* ── Alerte critique en haut si urgence ── */}
      {criticalAlerts > 0 && (
        <Link href="/admin/stocks/alertes?type=out_of_stock"
          className="flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 text-white hover:bg-red-700 transition shadow-md">
          <span className="text-2xl animate-pulse">🚨</span>
          <div className="flex-1">
            <p className="font-semibold">{criticalAlerts} produit{criticalAlerts > 1 ? "s" : ""} en rupture ou stock critique</p>
            <p className="text-xs text-red-200">Cliquez pour voir les alertes et réapprovisionner</p>
          </div>
          <span className="text-red-200 text-sm">Voir →</span>
        </Link>
      )}

      {/* ── KPIs cliquables ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">

        {/* Produits totaux */}
        <Link href="/admin/stocks/produits"
          className="col-span-1 flex flex-col rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">📦</span>
          <p className="text-2xl font-bold text-blue-700">{totalProducts.toLocaleString()}</p>
          <p className="text-xs text-blue-500 mt-0.5 font-medium">Produits</p>
          <p className="text-[10px] text-blue-400 mt-1 group-hover:underline">Voir tout →</p>
        </Link>

        {/* Unités en stock */}
        <Link href="/admin/stocks/produits?status=ok"
          className="col-span-1 flex flex-col rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">🏷️</span>
          <p className="text-2xl font-bold text-green-700">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-0.5 font-medium">Unités</p>
          <p className="text-[10px] text-green-400 mt-1 group-hover:underline">Stock OK →</p>
        </Link>

        {/* Valeur stock */}
        <Link href="/admin/stocks/produits"
          className="col-span-2 flex flex-col rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">💰</span>
          <p className="text-2xl font-bold text-amber-700 truncate">{formatDZD(stockValue)}</p>
          <p className="text-xs text-amber-500 mt-0.5 font-medium">Valeur totale du stock</p>
          <p className="text-[10px] text-amber-400 mt-1 group-hover:underline">Analyse →</p>
        </Link>

        {/* Ruptures — lien direct vers alertes rupture */}
        <Link href="/admin/stocks/alertes"
          className={`col-span-1 flex flex-col rounded-2xl border p-5 hover:shadow-md transition group
            ${outOfStock > 0 ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-100/50" : "border-gray-100 bg-gray-50"}`}>
          <span className="text-2xl mb-2">{outOfStock > 0 ? "🚨" : "✅"}</span>
          <p className={`text-2xl font-bold ${outOfStock > 0 ? "text-red-600" : "text-gray-400"}`}>{outOfStock}</p>
          <p className={`text-xs mt-0.5 font-medium ${outOfStock > 0 ? "text-red-500" : "text-gray-400"}`}>Ruptures</p>
          <p className={`text-[10px] mt-1 group-hover:underline ${outOfStock > 0 ? "text-red-400" : "text-gray-300"}`}>
            {outOfStock > 0 ? "Alertes →" : "Aucune →"}
          </p>
        </Link>

        {/* Stock faible — lien direct vers produits faibles */}
        <Link href="/admin/stocks/produits?status=faible"
          className={`col-span-1 flex flex-col rounded-2xl border p-5 hover:shadow-md transition group
            ${lowStock > 0 ? "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100/50" : "border-gray-100 bg-gray-50"}`}>
          <span className="text-2xl mb-2">{lowStock > 0 ? "⚠️" : "✅"}</span>
          <p className={`text-2xl font-bold ${lowStock > 0 ? "text-orange-600" : "text-gray-400"}`}>{lowStock}</p>
          <p className={`text-xs mt-0.5 font-medium ${lowStock > 0 ? "text-orange-500" : "text-gray-400"}`}>Stock faible</p>
          <p className={`text-[10px] mt-1 group-hover:underline ${lowStock > 0 ? "text-orange-400" : "text-gray-300"}`}>
            {lowStock > 0 ? "Voir produits →" : "Aucun →"}
          </p>
        </Link>
      </div>

      {/* ── Graphique état stocks + Alertes ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Répartition visuelle des stocks */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Répartition des stocks</h2>
          <div className="space-y-3">
            {[
              { label: "En stock (OK)", value: okStock, total: totalProducts, color: "bg-green-500", text: "text-green-600", href: "/admin/stocks/produits?status=ok" },
              { label: "Stock faible", value: lowStock, total: totalProducts, color: "bg-amber-400", text: "text-amber-600", href: "/admin/stocks/produits?status=faible" },
              { label: "Rupture totale", value: outOfStock, total: totalProducts, color: "bg-red-500", text: "text-red-600", href: "/admin/stocks/alertes" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="block group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 group-hover:text-shifaa-green">{item.label}</span>
                  <span className={`text-xs font-bold ${item.text}`}>{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.total ? Math.round((item.value / item.total) * 100) : 0}%` }} />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Accès rapides</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/stocks/mouvements"
                className="text-xs px-3 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-shifaa-green/10 hover:text-shifaa-green transition text-center">
                📋 Historique
              </Link>
              <Link href="/admin/stocks/entrepots"
                className="text-xs px-3 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-shifaa-green/10 hover:text-shifaa-green transition text-center">
                🏭 Entrepôts
              </Link>
              <Link href="/admin/stocks/inventaire"
                className="text-xs px-3 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-shifaa-green/10 hover:text-shifaa-green transition text-center">
                📦 Inventaire
              </Link>
              <Link href="/admin/stocks/mouvement"
                className="text-xs px-3 py-2 bg-shifaa-green/10 rounded-lg text-shifaa-green font-medium hover:bg-shifaa-green/20 transition text-center">
                ➕ Mouvement
              </Link>
            </div>
          </div>
        </div>

        {/* Alertes actives cliquables */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              🔔 Alertes
              {totalAlerts > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalAlerts}
                </span>
              )}
            </h2>
            <Link href="/admin/stocks/alertes" className="text-xs text-shifaa-green hover:underline font-medium">Tout voir →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(alerts ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm text-gray-400">Aucune alerte active</p>
              </div>
            ) : (alerts ?? []).map((a) => {
              const product = a.products as { id: string; name: string; brand: string; slug: string } | null;
              const alertHref = a.alert_type === "out_of_stock" || a.alert_type === "critical"
                ? `/admin/stocks/alertes`
                : `/admin/stocks/produits?status=faible`;
              return (
                <Link key={a.id} href={alertHref}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                  <span className="text-lg shrink-0">
                    {a.alert_type === "out_of_stock" ? "🚨"
                      : a.alert_type === "critical" ? "⚠️"
                      : a.alert_type === "low_stock" ? "📉" : "📦"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-shifaa-green">
                      {product?.name ?? "Produit"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {a.alert_type === "out_of_stock" ? "Rupture totale"
                        : a.alert_type === "critical" ? "Stock critique"
                        : a.alert_type === "low_stock" ? "Stock faible" : "Excédent"}
                      {" · "}{a.current_stock ?? 0} unités
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${a.alert_type === "out_of_stock" ? "bg-red-100 text-red-700"
                      : a.alert_type === "critical" ? "bg-orange-100 text-orange-700"
                      : "bg-amber-100 text-amber-700"}`}>
                    {a.alert_type === "out_of_stock" ? "Rupture"
                      : a.alert_type === "critical" ? "Critique" : "Faible"}
                  </span>
                </Link>
              );
            })}
          </div>
          {totalAlerts > 0 && (
            <div className="px-5 py-3 bg-red-50 border-t border-red-100">
              <Link href="/admin/stocks/alertes"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700">
                🚨 Traiter toutes les alertes →
              </Link>
            </div>
          )}
        </div>

        {/* Stocks critiques liste */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stocks critiques</h2>
            <Link href="/admin/stocks/produits?status=rupture" className="text-xs text-red-500 hover:underline font-medium">Ruptures →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(products ?? []).slice(0, 10).map((p) => {
              const s = (p.stock ?? 0);
              const status = s === 0
                ? { label: "Rupture", cls: "bg-red-100 text-red-700", bar: "bg-red-500", href: "/admin/stocks/alertes" }
                : s <= (p.stock_safety ?? 5)
                ? { label: "Critique", cls: "bg-orange-100 text-orange-700", bar: "bg-orange-500", href: "/admin/stocks/alertes" }
                : { label: "Faible", cls: "bg-amber-100 text-amber-700", bar: "bg-amber-400", href: `/admin/stocks/produits?status=faible` };
              const pct = p.stock_min ? Math.min(100, Math.round((s / p.stock_min) * 100)) : 0;
              return (
                <Link key={p.id} href={status.href}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-shifaa-green">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${s === 0 ? "text-red-600" : s <= 5 ? "text-orange-600" : "text-amber-600"}`}>
                        {s} unités
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.cls}`}>{status.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Link href="/admin/stocks/produits"
              className="flex items-center justify-center gap-1.5 text-xs text-shifaa-green hover:underline font-medium">
              Voir tous les produits →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Derniers mouvements ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Derniers mouvements</h2>
          <Link href="/admin/stocks/mouvements" className="text-xs text-shifaa-green hover:underline font-medium">
            Historique complet →
          </Link>
        </div>
        {(movements ?? []).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400">Aucun mouvement enregistré</p>
            <Link href="/admin/stocks/mouvement"
              className="mt-3 inline-block px-4 py-2 bg-shifaa-green text-white rounded-xl text-xs font-medium hover:bg-shifaa-dark">
              + Créer un mouvement
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(movements ?? []).map((m) => {
              const mt = moveTypeConfig[m.movement_type] ?? { label: m.movement_type, color: "text-gray-600", bg: "bg-gray-100" };
              const product = m.products as { name: string; brand: string } | null;
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                  <div className="shrink-0 text-right w-16">
                    <p className="text-[10px] text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {new Date(m.created_at).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{product?.brand}{m.reference ? ` · ${m.reference}` : ""}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${mt.bg} ${mt.color}`}>
                    {mt.label}
                  </span>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </p>
                    <p className="text-[10px] text-gray-400">{m.qty_before} → {m.qty_after}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
