import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { extractRelation } from "@/lib/supabase-helpers";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des stocks | Admin Shifaa" };

export default async function StocksPage() {
  const supabase = createAdminClient();

  // ── Requêtes parallèles précises — pas de limit() sur les stats ──
  const [
    kpiResult,
    alertsResult,
    movementsResult,
    criticalProductsResult,
  ] = await Promise.all([
    // KPIs exacts sur TOUS les produits actifs
    supabase.rpc("get_stock_kpis"),
    // Alertes actives
    supabase
      .from("stock_alerts")
      .select("id, alert_type, current_stock, created_at, products(id, name, brand, slug)")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(10),
    // Derniers mouvements
    supabase
      .from("stock_movements")
      .select("id, movement_type, quantity, qty_before, qty_after, reference, created_at, products(name, brand)")
      .order("created_at", { ascending: false })
      .limit(8),
    // Produits critiques (stock faible et rupture)
    supabase
      .from("products")
      .select("id, name, brand, stock, stock_min, stock_safety, stock_max, slug")
      .eq("is_active", true)
      .lte("stock", 10)
      .order("stock", { ascending: true })
      .limit(10),
  ]);

  // Utiliser les KPIs depuis la RPC ou fallback SQL direct
  let kpis = kpiResult.data as {
    total_products: number;
    out_of_stock: number;
    critical: number;
    low_stock: number;
    ok_stock: number;
    total_units: number;
    stock_value: number;
  } | null;

  // Fallback si la RPC n'existe pas encore
  if (!kpis || kpiResult.error) {
    const { data: fallback } = await supabase
      .from("products")
      .select("stock, price, is_active")
      .eq("is_active", true);

    const rows = fallback ?? [];
    kpis = {
      total_products: rows.length,
      out_of_stock:   rows.filter((p) => (p.stock ?? 0) === 0).length,
      critical:       rows.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length,
      low_stock:      rows.filter((p) => (p.stock ?? 0) > 5 && (p.stock ?? 0) <= 10).length,
      ok_stock:       rows.filter((p) => (p.stock ?? 0) > 10).length,
      total_units:    rows.reduce((s, p) => s + (p.stock ?? 0), 0),
      stock_value:    rows.reduce((s, p) => s + ((p.stock ?? 0) * (p.price ?? 0)), 0),
    };
  }

  const alerts          = alertsResult.data ?? [];
  const movements       = movementsResult.data ?? [];
  const criticalProducts = criticalProductsResult.data ?? [];

  const totalAlerts    = alerts.length;
  const criticalAlerts = alerts.filter((a) => ["critical", "out_of_stock"].includes(a.alert_type)).length;

  const moveTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    entry:      { label: "Entrée",     color: "text-green-700",  bg: "bg-green-100" },
    exit:       { label: "Sortie",     color: "text-red-700",    bg: "bg-red-100" },
    transfer:   { label: "Transfert",  color: "text-blue-700",   bg: "bg-blue-100" },
    adjustment: { label: "Ajustement",color: "text-amber-700",  bg: "bg-amber-100" },
    return:     { label: "Retour",     color: "text-purple-700", bg: "bg-purple-100" },
    defect:     { label: "Défaut",     color: "text-gray-700",   bg: "bg-gray-100" },
  };

  const stockOf = (s: number) =>
    s === 0       ? { label: "Rupture",  cls: "bg-red-100 text-red-700",    bar: "bg-red-500" }
    : s <= 5      ? { label: "Critique", cls: "bg-orange-100 text-orange-700", bar: "bg-orange-500" }
    : s <= 10     ? { label: "Faible",   cls: "bg-amber-100 text-amber-700",  bar: "bg-amber-400" }
    :               { label: "OK",       cls: "bg-green-100 text-green-700",  bar: "bg-green-500" };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Temps réel · Alertes · Mouvements · Entrepôts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/stocks/mouvement"
            className="flex items-center gap-1.5 px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark shadow-sm transition">
            <span>📥</span> Nouveau mouvement
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

      {/* ── Bannière alerte critique ── */}
      {criticalAlerts > 0 && (
        <Link href="/admin/stocks/alertes"
          className="flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 text-white hover:bg-red-700 transition shadow-md">
          <span className="text-2xl animate-pulse">🚨</span>
          <div className="flex-1">
            <p className="font-semibold">
              {kpis.out_of_stock} rupture{kpis.out_of_stock > 1 ? "s" : ""} +{" "}
              {kpis.critical} stock{kpis.critical > 1 ? "s" : ""} critique{kpis.critical > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-red-200">Cliquez pour voir les {totalAlerts} alertes et réapprovisionner</p>
          </div>
          <span className="text-red-200 text-sm">Voir →</span>
        </Link>
      )}

      {/* ── KPIs exacts ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">

        <Link href="/admin/stocks/produits"
          className="col-span-1 flex flex-col rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">📦</span>
          <p className="text-2xl font-bold text-blue-700">{kpis.total_products.toLocaleString("fr-DZ")}</p>
          <p className="text-xs text-blue-500 mt-0.5 font-medium">Produits actifs</p>
          <p className="text-[10px] text-blue-400 mt-1 group-hover:underline">Voir tout →</p>
        </Link>

        <Link href="/admin/stocks/produits?status=ok"
          className="col-span-1 flex flex-col rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">🏷️</span>
          <p className="text-2xl font-bold text-green-700">{kpis.total_units.toLocaleString("fr-DZ")}</p>
          <p className="text-xs text-green-500 mt-0.5 font-medium">Unités en stock</p>
          <p className="text-[10px] text-green-400 mt-1 group-hover:underline">
            {kpis.ok_stock.toLocaleString()} produits OK →
          </p>
        </Link>

        <Link href="/admin/stocks/produits"
          className="col-span-2 flex flex-col rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/50 p-5 hover:shadow-md transition group">
          <span className="text-2xl mb-2">💰</span>
          <p className="text-2xl font-bold text-amber-700 truncate">{formatDZD(kpis.stock_value)}</p>
          <p className="text-xs text-amber-500 mt-0.5 font-medium">Valeur totale du stock</p>
          <p className="text-[10px] text-amber-400 mt-1 group-hover:underline">Analyse →</p>
        </Link>

        <Link href="/admin/stocks/alertes"
          className={`col-span-1 flex flex-col rounded-2xl border p-5 hover:shadow-md transition group
            ${kpis.out_of_stock > 0
              ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-100/50"
              : "border-gray-100 bg-gray-50"}`}>
          <span className="text-2xl mb-2">{kpis.out_of_stock > 0 ? "🚨" : "✅"}</span>
          <p className={`text-2xl font-bold ${kpis.out_of_stock > 0 ? "text-red-600" : "text-gray-400"}`}>
            {kpis.out_of_stock}
          </p>
          <p className={`text-xs mt-0.5 font-medium ${kpis.out_of_stock > 0 ? "text-red-500" : "text-gray-400"}`}>
            Ruptures
          </p>
          <p className={`text-[10px] mt-1 group-hover:underline ${kpis.out_of_stock > 0 ? "text-red-400" : "text-gray-300"}`}>
            {kpis.out_of_stock > 0 ? "Alertes →" : "Aucune →"}
          </p>
        </Link>

        <Link href="/admin/stocks/produits?status=faible"
          className={`col-span-1 flex flex-col rounded-2xl border p-5 hover:shadow-md transition group
            ${(kpis.critical + kpis.low_stock) > 0
              ? "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100/50"
              : "border-gray-100 bg-gray-50"}`}>
          <span className="text-2xl mb-2">{(kpis.critical + kpis.low_stock) > 0 ? "⚠️" : "✅"}</span>
          <p className={`text-2xl font-bold ${(kpis.critical + kpis.low_stock) > 0 ? "text-orange-600" : "text-gray-400"}`}>
            {kpis.critical + kpis.low_stock}
          </p>
          <p className={`text-xs mt-0.5 font-medium ${(kpis.critical + kpis.low_stock) > 0 ? "text-orange-500" : "text-gray-400"}`}>
            Stock faible
          </p>
          <p className={`text-[10px] mt-1 group-hover:underline ${(kpis.critical + kpis.low_stock) > 0 ? "text-orange-400" : "text-gray-300"}`}>
            {kpis.critical > 0 ? `dont ${kpis.critical} critique${kpis.critical > 1 ? "s" : ""} →` : "Voir produits →"}
          </p>
        </Link>
      </div>

      {/* ── Répartition + Alertes + Stocks critiques ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Répartition des stocks */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Répartition des stocks</h2>
          <div className="space-y-3">
            {[
              { label: "En stock (OK)",  value: kpis.ok_stock,   total: kpis.total_products, color: "bg-green-500",  text: "text-green-600",  href: "/admin/stocks/produits?status=ok" },
              { label: "Stock faible",   value: kpis.low_stock,  total: kpis.total_products, color: "bg-amber-400",  text: "text-amber-600",  href: "/admin/stocks/produits?status=faible" },
              { label: "Stock critique", value: kpis.critical,   total: kpis.total_products, color: "bg-orange-500", text: "text-orange-600", href: "/admin/stocks/produits?status=critique" },
              { label: "Rupture totale", value: kpis.out_of_stock, total: kpis.total_products, color: "bg-red-500",  text: "text-red-600",    href: "/admin/stocks/alertes" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="block group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 group-hover:text-shifaa-green">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold ${item.text}`}>{item.value.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-300">
                      ({item.total ? Math.round((item.value / item.total) * 100) : 0}%)
                    </span>
                  </div>
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
                ➕ Mouvement BL
              </Link>
            </div>
          </div>
        </div>

        {/* Alertes actives */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              🔔 Alertes
              {totalAlerts > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              )}
            </h2>
            <Link href="/admin/stocks/alertes" className="text-xs text-shifaa-green hover:underline font-medium">
              Tout voir ({kpis.out_of_stock + kpis.critical}) →
            </Link>
          </div>

          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm text-gray-400">Aucune alerte active</p>
              </div>
            ) : alerts.map((a) => {
              const product = extractRelation<{ id: string; name: string; brand: string; slug: string }>(a.products);
              return (
                <Link key={a.id}
                  href="/admin/stocks/alertes"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                  <span className="text-lg shrink-0">
                    {a.alert_type === "out_of_stock" ? "🚨"
                      : a.alert_type === "critical"   ? "⚠️"
                      : "📉"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-shifaa-green">
                      {product?.name ?? "—"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {product?.brand} · {a.current_stock ?? 0} unité{(a.current_stock ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${a.alert_type === "out_of_stock" ? "bg-red-100 text-red-700"
                      : a.alert_type === "critical"   ? "bg-orange-100 text-orange-700"
                      : "bg-amber-100 text-amber-700"}`}>
                    {a.alert_type === "out_of_stock" ? "Rupture"
                      : a.alert_type === "critical" ? "Critique" : "Faible"}
                  </span>
                </Link>
              );
            })}
          </div>

          {(kpis.out_of_stock + kpis.critical) > 0 && (
            <div className="px-5 py-3 bg-red-50 border-t border-red-100">
              <Link href="/admin/stocks/alertes"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700">
                🚨 Traiter les {kpis.out_of_stock + kpis.critical} alertes →
              </Link>
            </div>
          )}
        </div>

        {/* Stocks critiques */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stocks critiques</h2>
            <Link href="/admin/stocks/produits?status=rupture"
              className="text-xs text-red-500 hover:underline font-medium">
              {kpis.out_of_stock} ruptures →
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {criticalProducts.map((p) => {
              const s   = p.stock ?? 0;
              const st  = stockOf(s);
              const max = p.stock_min ?? 10;
              const pct = max > 0 ? Math.min(100, Math.round((s / max) * 100)) : 0;
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${s === 0 ? "text-red-600" : s <= 5 ? "text-orange-600" : "text-amber-600"}`}>
                        {s} unité{s > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                    <Link href="/admin/stocks/mouvement"
                      className="text-[10px] px-2 py-1 border border-gray-200 rounded text-shifaa-green hover:bg-shifaa-green/5 font-medium">
                      + BL
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <Link href="/admin/stocks/produits"
              className="flex items-center justify-center gap-1.5 text-xs text-shifaa-green hover:underline font-medium">
              Voir les {kpis.total_products.toLocaleString()} produits →
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
        {movements.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400">Aucun mouvement enregistré</p>
            <Link href="/admin/stocks/mouvement"
              className="mt-3 inline-block px-4 py-2 bg-shifaa-green text-white rounded-xl text-xs font-medium hover:bg-shifaa-dark">
              + Créer un BL
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {movements.map((m) => {
              const mt      = moveTypeConfig[m.movement_type] ?? { label: m.movement_type, color: "text-gray-600", bg: "bg-gray-100" };
              const product = extractRelation<{ name: string; brand: string }>(m.products);
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                  <div className="shrink-0 text-right w-14">
                    <p className="text-[10px] text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {new Date(m.created_at).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">
                      {product?.brand}{m.reference ? ` · ${m.reference}` : ""}
                    </p>
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
