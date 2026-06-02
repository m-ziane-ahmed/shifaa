import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrepôts | Admin Shifaa" };

export default async function EntrepotsPage() {
  const supabase = createAdminClient();

  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("*")
    .order("created_at");

  const { data: stockByWarehouse } = await supabase
    .from("warehouse_stock")
    .select("warehouse_id, qty_available");

  const stockTotals = (stockByWarehouse ?? []).reduce((acc, s) => {
    acc[s.warehouse_id] = (acc[s.warehouse_id] ?? 0) + (s.qty_available ?? 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Entrepôts</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Entrepôts</h1>
          <p className="text-sm text-gray-500">{(warehouses ?? []).length} entrepôt{(warehouses ?? []).length > 1 ? "s" : ""} configuré{(warehouses ?? []).length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/stocks/entrepots/nouveau"
          className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
          + Ajouter un entrepôt
        </Link>
      </div>

      <div className="space-y-4">
        {(warehouses ?? []).map((w) => (
          <div key={w.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{w.code}</span>
                  {w.is_default && <span className="text-xs bg-shifaa-green/10 text-shifaa-green px-2 py-0.5 rounded-full">Principal</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {w.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
                {w.address && <p className="text-sm text-gray-500">{w.address}{w.wilaya ? `, ${w.wilaya}` : ""}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{(stockTotals[w.id] ?? 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">unités en stock</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <Link href={`/admin/stocks/mouvement?warehouse_id=${w.id}`}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-shifaa-green hover:text-shifaa-green">
                + Mouvement
              </Link>
              <Link href={`/admin/stocks/inventaire?warehouse_id=${w.id}`}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-shifaa-green hover:text-shifaa-green">
                📋 Inventaire
              </Link>
            </div>
          </div>
        ))}

        {(warehouses ?? []).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">🏭</p>
            <p className="font-medium text-gray-700">Aucun entrepôt configuré</p>
          </div>
        )}
      </div>
    </div>
  );
}
