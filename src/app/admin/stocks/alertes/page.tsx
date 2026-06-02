import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alertes stock | Admin Shifaa" };

export default async function AlertesStockPage() {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from("stock_alerts")
    .select("*, products(id, name, brand, stock, slug)")
    .eq("is_resolved", false)
    .order("created_at", { ascending: false });

  const alertConfig = {
    out_of_stock: { label: "Rupture totale", icon: "🚨", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
    critical:     { label: "Stock critique", icon: "⚠️", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
    low_stock:    { label: "Stock faible",   icon: "📉", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    overstock:    { label: "Excédent",       icon: "📦", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
    expiry_soon:  { label: "Expiration proche", icon: "⏰", bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
    reorder:      { label: "Réappro suggéré", icon: "🔄", bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700" },
  };

  const grouped = {
    out_of_stock: (alerts ?? []).filter((a) => a.alert_type === "out_of_stock"),
    critical:     (alerts ?? []).filter((a) => a.alert_type === "critical"),
    low_stock:    (alerts ?? []).filter((a) => a.alert_type === "low_stock"),
    overstock:    (alerts ?? []).filter((a) => a.alert_type === "overstock"),
    expiry_soon:  (alerts ?? []).filter((a) => a.alert_type === "expiry_soon"),
    reorder:      (alerts ?? []).filter((a) => a.alert_type === "reorder"),
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Alertes</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Alertes de stock</h1>
          <p className="text-sm text-gray-500">{(alerts ?? []).length} alerte{(alerts ?? []).length > 1 ? "s" : ""} active{(alerts ?? []).length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/stocks/mouvement" className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
          + Mouvement de stock
        </Link>
      </div>

      {(alerts ?? []).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="font-semibold text-gray-700 text-lg">Aucune alerte active</p>
          <p className="text-sm text-gray-400 mt-1">Tous les stocks sont dans les seuils normaux</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(grouped) as [keyof typeof alertConfig, typeof alerts][]).map(([type, items]) => {
            if (!items || items.length === 0) return null;
            const cfg = alertConfig[type];
            return (
              <div key={type}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${cfg.badge}`}>{items.length}</span>
                </h2>
                <div className="space-y-2">
                  {items.map((alert) => {
                    const product = alert.products as { id: string; name: string; brand: string; stock: number; slug: string } | null;
                    return (
                      <div key={alert.id} className={`flex items-center gap-4 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product?.name ?? "Produit inconnu"}</p>
                          <p className="text-xs text-gray-500">{product?.brand} · Stock actuel : <strong>{alert.current_stock ?? product?.stock ?? 0} unités</strong>
                            {alert.threshold != null && <> · Seuil : {alert.threshold} unités</>}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 shrink-0">
                          {new Date(alert.created_at).toLocaleDateString("fr-DZ")}
                        </p>
                        <div className="flex gap-2 shrink-0">
                          <Link href={`/admin/stocks/mouvement?product_id=${product?.id}`}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-shifaa-green text-gray-700">
                            Réapprovisionner
                          </Link>
                          {product?.id && (
                            <Link href={`/admin/produits/${product.id}`}
                              className="px-3 py-1.5 text-xs text-gray-400 hover:text-shifaa-green">
                              Fiche →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
