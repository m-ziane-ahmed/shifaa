import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: movements }, { data: warehouseStock }, { data: lots }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("stock_movements").select("*").eq("product_id", id)
      .order("created_at", { ascending: false }).limit(20),
    supabase.from("warehouse_stock").select("*, warehouses(name, code)")
      .eq("product_id", id),
    supabase.from("product_lots").select("*").eq("product_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!product) notFound();

  const totalStock = (warehouseStock ?? []).reduce((s, w) => s + (w.qty_available ?? 0), 0);
  const stockValue = totalStock * (product.cost_price ?? product.price ?? 0);
  const status = totalStock === 0 ? { label: "Rupture", cls: "bg-red-100 text-red-700" }
    : totalStock <= (product.stock_safety ?? 5) ? { label: "Critique", cls: "bg-orange-100 text-orange-700" }
    : totalStock <= (product.stock_min ?? 10) ? { label: "Faible", cls: "bg-amber-100 text-amber-700" }
    : { label: "OK", cls: "bg-green-100 text-green-700" };

  const moveTypeConfig: Record<string, { label: string; color: string }> = {
    entry:      { label: "Entrée",     color: "text-green-600" },
    exit:       { label: "Sortie",     color: "text-red-600" },
    transfer:   { label: "Transfert",  color: "text-blue-600" },
    adjustment: { label: "Ajustement", color: "text-amber-600" },
    return:     { label: "Retour",     color: "text-purple-600" },
    defect:     { label: "Défaut",     color: "text-gray-500" },
  };

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb + header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span>
            <Link href="/admin/stocks/produits" className="hover:text-shifaa-green">Produits</Link>
            <span>›</span>
            <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-400">{product.brand} · {product.sku ?? "Pas de SKU"}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/admin/stocks/mouvement?product_id=${id}`}
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark transition">
            + Mouvement
          </Link>
          <Link href={`/admin/produits/${id}`}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            Fiche produit →
          </Link>
        </div>
      </div>

      {/* KPIs stock */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className={`rounded-2xl border p-4 ${status.cls.replace("text-", "border-").replace("700", "200").replace("600", "200")} bg-white`}>
          <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unités en stock</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.cls}`}>
            {status.label}
          </span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{formatDZD(product.price ?? 0)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Prix de vente</p>
          {product.cost_price && (
            <p className="text-[10px] text-green-600 mt-1 font-medium">
              Marge : {Math.round(((product.price - product.cost_price) / product.price) * 100)}%
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{formatDZD(stockValue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Valeur du stock</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Seuils</p>
          <div className="space-y-0.5 text-xs">
            <p className="flex justify-between"><span className="text-gray-400">Min</span><span className="font-medium">{product.stock_min ?? 10}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Sécurité</span><span className="font-medium">{product.stock_safety ?? 5}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Max</span><span className="font-medium">{product.stock_max ?? 100}</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        {/* Stock par entrepôt */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stock par entrepôt</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(warehouseStock ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-center text-gray-400">Aucun stock enregistré</p>
            ) : (warehouseStock ?? []).map((ws) => {
              const wh = ws.warehouses as { name: string; code: string } | null;
              return (
                <div key={ws.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{wh?.name ?? "Entrepôt"}</p>
                    <p className="text-sm font-bold text-gray-900">{ws.qty_available} unités</p>
                  </div>
                  {ws.qty_reserved > 0 && (
                    <p className="text-[10px] text-orange-500">⚡ {ws.qty_reserved} réservées</p>
                  )}
                  {ws.expiry_date && (
                    <p className="text-[10px] text-purple-500">⏰ Exp: {new Date(ws.expiry_date).toLocaleDateString("fr-DZ")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lots */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Lots ({(lots ?? []).length})</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {(lots ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-center text-gray-400">Aucun lot enregistré</p>
            ) : (lots ?? []).map((lot) => (
              <div key={lot.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-medium text-gray-700">{lot.lot_number}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                    ${lot.status === "active" ? "bg-green-100 text-green-700"
                      : lot.status === "expired" ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-500"}`}>
                    {lot.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Qté: {lot.qty}
                  {lot.expiry_date && ` · Exp: ${new Date(lot.expiry_date).toLocaleDateString("fr-DZ")}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Infos produit */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Informations</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-gray-400">Catégorie</span><span className="font-medium">{product.category}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Statut</span>
              <span className={`text-xs font-medium ${product.status === "published" ? "text-green-600" : "text-gray-500"}`}>
                {product.status}
              </span>
            </p>
            <p className="flex justify-between"><span className="text-gray-400">Barcode</span><span className="font-mono text-xs">{product.barcode ?? "—"}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Poids</span><span>{product.weight_grams ? `${product.weight_grams}g` : "—"}</span></p>
            {product.last_restock_at && (
              <p className="flex justify-between"><span className="text-gray-400">Dernier réappro</span>
                <span className="text-xs">{new Date(product.last_restock_at).toLocaleDateString("fr-DZ")}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historique mouvements */}
      <div className="mt-5 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historique des mouvements</h2>
          <span className="text-xs text-gray-400">{(movements ?? []).length} derniers</span>
        </div>
        {(movements ?? []).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400">Aucun mouvement enregistré</p>
            <Link href={`/admin/stocks/mouvement?product_id=${id}`}
              className="mt-3 inline-block px-4 py-2 bg-shifaa-green text-white rounded-xl text-xs hover:bg-shifaa-dark">
              + Créer un mouvement
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Type", "Quantité", "Avant → Après", "Référence", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(movements ?? []).map((m) => {
                const mt = moveTypeConfig[m.movement_type] ?? { label: m.movement_type, color: "text-gray-600" };
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                    </td>
                    <td className={`px-4 py-2.5 text-xs font-semibold ${mt.color}`}>{mt.label}</td>
                    <td className={`px-4 py-2.5 font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{m.qty_before} → {m.qty_after}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{m.reference ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[150px] truncate">{m.notes ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
