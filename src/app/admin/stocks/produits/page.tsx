import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stocks produits | Admin Shifaa" };

export default async function StocksProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;
  const currentPage = Number(page ?? 1);
  const pageSize = 30;
  const supabase = createAdminClient();

  let query = supabase
    .from("products")
    .select("id, name, brand, category, stock, stock_min, stock_safety, stock_max, price, cost_price, is_active, sku", { count: "exact" })
    .order("stock", { ascending: true })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,sku.ilike.%${q}%`);
  if (status === "rupture")  query = query.eq("stock", 0);
  if (status === "critique") query = query.gt("stock", 0).lte("stock", 5);
  if (status === "faible")   query = query.gt("stock", 5).lte("stock", 15);
  if (status === "ok")       query = query.gt("stock", 15);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const statusOf = (stock: number, min: number, safety: number) =>
    stock === 0       ? { label: "Rupture",  cls: "bg-red-100 text-red-700",    bar: "bg-red-500" }
    : stock <= safety ? { label: "Critique", cls: "bg-orange-100 text-orange-700", bar: "bg-orange-500" }
    : stock <= min    ? { label: "Faible",   cls: "bg-amber-100 text-amber-700",  bar: "bg-amber-400" }
    :                   { label: "OK",       cls: "bg-green-100 text-green-700",  bar: "bg-green-500" };

  const FILTERS = [
    { value: "",         label: "Tous" },
    { value: "rupture",  label: "Rupture" },
    { value: "critique", label: "Critique" },
    { value: "faible",   label: "Faible" },
    { value: "ok",       label: "OK" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Produits</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Stocks par produit</h1>
          <p className="text-sm text-gray-500">{count ?? 0} produit{(count ?? 0) > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/stocks/mouvement"
          className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
          + Mouvement de stock
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <form className="flex-1 min-w-48">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher produit, marque, SKU…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
          />
        </form>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <Link key={f.value}
              href={`/admin/stocks/produits?status=${f.value}${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                ${status === f.value || (!status && !f.value)
                  ? "bg-shifaa-green text-white border-shifaa-green"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Produit", "SKU", "Stock actuel", "Niveaux", "Prix vente", "Marge", "Statut", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (products ?? []).map((p) => {
                const st = statusOf(p.stock ?? 0, p.stock_min ?? 10, p.stock_safety ?? 5);
                const pct = p.stock_max ? Math.min(100, Math.round(((p.stock ?? 0) / p.stock_max) * 100)) : 0;
                const margin = p.cost_price && p.price
                  ? Math.round(((p.price - p.cost_price) / p.price) * 100)
                  : null;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 max-w-[180px] truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.sku ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className={`text-lg font-bold ${(p.stock ?? 0) === 0 ? "text-red-600" : (p.stock ?? 0) <= 5 ? "text-orange-600" : "text-gray-900"}`}>
                        {p.stock ?? 0}
                      </p>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      <div className="space-y-0.5">
                        <p>Min: <span className="font-medium text-gray-600">{p.stock_min ?? 10}</span></p>
                        <p>Sécu: <span className="font-medium text-gray-600">{p.stock_safety ?? 5}</span></p>
                        <p>Max: <span className="font-medium text-gray-600">{p.stock_max ?? 100}</span></p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-shifaa-green">
                      {p.price ? `${p.price.toLocaleString()} DZD` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {margin !== null ? (
                        <span className={`text-xs font-bold ${margin >= 30 ? "text-green-600" : margin >= 15 ? "text-amber-600" : "text-red-600"}`}>
                          {margin}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/stocks/mouvement?product_id=${p.id}`}
                          className="text-xs px-2 py-1 border border-gray-200 rounded text-gray-600 hover:border-shifaa-green hover:text-shifaa-green">
                          Mouvement
                        </Link>
                        <Link href={`/admin/produits/${p.id}`}
                          className="text-xs text-gray-400 hover:text-shifaa-green">
                          Fiche →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {currentPage} / {totalPages}</p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/admin/stocks/produits?page=${currentPage - 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">← Précédent</Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/admin/stocks/produits?page=${currentPage + 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Suivant →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
