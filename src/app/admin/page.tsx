import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord | Admin Shifaa" };

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Stats parallèles
  const [
    { data: recentOrders },
    { data: topProducts },
    { data: stockAlerts },
    { data: ordersData },
    { count: customersCount },
    { count: productsCount },
  ] = await Promise.all([
    supabase.from("orders")
      .select("id, total, status, payment, wilaya, created_at, guest_name")
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("order_items")
      .select("name, brand, quantity, price")
      .order("quantity", { ascending: false }).limit(5),
    supabase.from("stock_alerts")
      .select("alert_type, products(name)")
      .eq("is_resolved", false).limit(5),
    supabase.from("orders").select("total, status, created_at"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  // Calculer les stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allOrders = ordersData ?? [];
  const s = {
    total_orders: allOrders.length,
    total_revenue: allOrders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0),
    revenue_today: allOrders.filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= todayStart).reduce((a, o) => a + o.total, 0),
    revenue_this_month: allOrders.filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= monthStart).reduce((a, o) => a + o.total, 0),
    total_customers: profilesCount ?? 0,
    total_products: productsCount ?? 0,
    pending_orders: allOrders.filter((o) => o.status === "pending").length,
    shipped_orders: allOrders.filter((o) => o.status === "shipped").length,
    delivered_orders: allOrders.filter((o) => o.status === "delivered").length,
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending:   { label: "En attente",  color: "bg-amber-100 text-amber-800",  dot: "bg-amber-400" },
    confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-800",    dot: "bg-blue-400" },
    shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
    delivered: { label: "Livrée",      color: "bg-green-100 text-green-800",   dot: "bg-green-500" },
    cancelled: { label: "Annulée",     color: "bg-red-100 text-red-800",       dot: "bg-red-400" },
  };

  const today = new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/commandes?status=pending"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 shadow-sm transition">
            📦 Commandes en attente
            {(s.pending_orders ?? 0) > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-600 text-[10px] font-bold">
                {s.pending_orders}
              </span>
            )}
          </Link>
          <Link href="/admin/stocks/alertes"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition">
            🔔 Alertes stock
          </Link>
        </div>
      </div>

      {/* ── KPIs principaux ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/admin/commandes"
          className="col-span-1 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/60 p-5 hover:shadow-md transition group">
          <p className="text-2xl mb-2">🛒</p>
          <p className="text-3xl font-bold text-blue-700">{(s.total_orders ?? 0).toLocaleString()}</p>
          <p className="text-xs text-blue-500 mt-1 font-medium">Commandes totales</p>
          <p className="text-[10px] text-blue-400 mt-1 group-hover:underline">Voir tout →</p>
        </Link>

        <div className="col-span-1 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100/60 p-5">
          <p className="text-2xl mb-2">💰</p>
          <p className="text-2xl font-bold text-emerald-700 truncate">{formatDZD(s.total_revenue ?? 0)}</p>
          <p className="text-xs text-emerald-500 mt-1 font-medium">CA total</p>
          <div className="mt-2 flex gap-3 text-[10px] text-emerald-400">
            <span>Aujourd&apos;hui : {formatDZD(s.revenue_today ?? 0)}</span>
          </div>
        </div>

        <Link href="/admin/clients"
          className="col-span-1 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-100/60 p-5 hover:shadow-md transition group">
          <p className="text-2xl mb-2">👥</p>
          <p className="text-3xl font-bold text-purple-700">{(s.total_customers ?? 0).toLocaleString()}</p>
          <p className="text-xs text-purple-500 mt-1 font-medium">Clients inscrits</p>
          <p className="text-[10px] text-purple-400 mt-1 group-hover:underline">Gérer →</p>
        </Link>

        <Link href="/admin/produits"
          className="col-span-1 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/60 p-5 hover:shadow-md transition group">
          <p className="text-2xl mb-2">📦</p>
          <p className="text-3xl font-bold text-gray-700">{(s.total_products ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Produits actifs</p>
          <p className="text-[10px] text-gray-400 mt-1 group-hover:underline">Catalogue →</p>
        </Link>
      </div>

      {/* ── CA du mois + statuts commandes ── */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* CA ce mois */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Performance ce mois</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
              <div>
                <p className="text-xs text-green-600 font-medium">CA ce mois</p>
                <p className="text-2xl font-bold text-green-700">{formatDZD(s.revenue_this_month ?? 0)}</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div>
                <p className="text-xs text-blue-600 font-medium">CA aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-blue-700">{formatDZD(s.revenue_today ?? 0)}</p>
              </div>
              <span className="text-3xl">☀️</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: "En attente", val: s.pending_orders ?? 0, href: "/admin/commandes?status=pending", cls: "bg-amber-50 text-amber-700 border-amber-100" },
                { label: "Expédiées",  val: s.shipped_orders ?? 0, href: "/admin/commandes?status=shipped", cls: "bg-purple-50 text-purple-700 border-purple-100" },
                { label: "Livrées",    val: s.delivered_orders ?? 0, href: "/admin/commandes?status=delivered", cls: "bg-green-50 text-green-700 border-green-100" },
              ].map((item) => (
                <Link key={item.label} href={item.href}
                  className={`flex flex-col items-center p-2.5 rounded-xl border text-center hover:shadow-sm transition ${item.cls}`}>
                  <p className="text-lg font-bold">{item.val}</p>
                  <p className="text-[10px] font-medium">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes stocks + top produits */}
        <div className="lg:col-span-3 space-y-5">

          {/* Alertes stocks */}
          {(stockAlerts ?? []).length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  🚨 Alertes stock
                  <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">{(stockAlerts ?? []).length}</span>
                </h3>
                <Link href="/admin/stocks/alertes" className="text-xs text-red-600 hover:underline font-medium">Voir tout →</Link>
              </div>
              <div className="space-y-1.5">
                {(stockAlerts ?? []).slice(0, 3).map((a, i) => {
                  const product = (a.products as unknown as { name: string } | null);
                  return (
                    <Link key={i} href="/admin/stocks/alertes"
                      className="flex items-center gap-2 text-xs text-red-700 hover:text-red-900">
                      <span>{a.alert_type === "out_of_stock" ? "🚨" : "⚠️"}</span>
                      <span className="truncate">{product?.name ?? "Produit"}</span>
                      <span className="ml-auto shrink-0 opacity-60">
                        {a.alert_type === "out_of_stock" ? "Rupture" : "Faible"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top produits vendus */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Top produits vendus</h3>
              <Link href="/admin/rapports" className="text-xs text-shifaa-green hover:underline">Rapports →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(topProducts ?? []).length === 0 ? (
                <p className="px-5 py-6 text-sm text-center text-gray-400">Aucune vente enregistrée</p>
              ) : (topProducts ?? []).map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">{p.quantity} ventes</p>
                    <p className="text-xs text-gray-400">{formatDZD(p.price * p.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Commandes récentes ── */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-xs text-shifaa-green hover:underline font-medium">Voir tout →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["N° commande", "Client", "Wilaya", "Paiement", "Total", "Statut", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recentOrders ?? []).map((o) => {
                const st = STATUS_CONFIG[o.status] ?? { label: o.status, color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[120px] truncate">
                      {o.guest_name ?? "Client connecté"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.wilaya}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                        {o.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatDZD(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/commandes/${encodeURIComponent(o.id)}`}
                        className="text-xs text-shifaa-green hover:underline">
                        Détails →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Aucune commande pour l&apos;instant
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Accès rapides ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/produits/nouveau", icon: "➕", label: "Nouveau produit", cls: "bg-shifaa-green/10 text-shifaa-green border-shifaa-green/20" },
          { href: "/admin/stocks/mouvement", icon: "📥", label: "Mouvement stock", cls: "bg-blue-50 text-blue-700 border-blue-200" },
          { href: "/admin/codes-promo", icon: "🎟️", label: "Codes promo", cls: "bg-amber-50 text-amber-700 border-amber-200" },
          { href: "/admin/rapports", icon: "📊", label: "Rapports", cls: "bg-purple-50 text-purple-700 border-purple-200" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 rounded-xl border p-4 hover:shadow-sm transition ${item.cls}`}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
