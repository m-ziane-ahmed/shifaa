import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produits | Admin Shifaa" };

async function toggleProduct(id: string, active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("products").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/produits");
}

async function updateStock(id: string, stock: number) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("products").update({ stock }).eq("id", id);
  revalidatePath("/admin/produits");
}

export default async function AdminProduits({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 20;

  let query = supabase
    .from("products")
    .select("id, slug, name, brand, category, price, stock, is_active, is_new, is_best_seller, rating, review_count", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.q) query = query.or(`name.ilike.%${params.q}%,brand.ilike.%${params.q}%`);
  if (params.category) query = query.eq("category", params.category);
  if (params.stock === "out") query = query.eq("stock", 0);
  if (params.stock === "low") query = query.gt("stock", 0).lte("stock", 5);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
        <span className="text-sm text-gray-500">{count} produit{(count ?? 0) > 1 ? "s" : ""}</span>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <form className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={params.q} placeholder="Nom, marque…"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
          <select name="category" defaultValue={params.category}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30">
            <option value="">Toutes catégories</option>
            {categories.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select name="stock" defaultValue={params.stock}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30">
            <option value="">Tout le stock</option>
            <option value="out">Rupture (stock=0)</option>
            <option value="low">Stock faible (≤5)</option>
          </select>
          <button type="submit" className="bg-shifaa-green text-white px-4 py-1.5 rounded-lg text-sm hover:bg-shifaa-dark transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-left">Catégorie</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Note</th>
                <th className="px-4 py-3 text-center">Tags</th>
                <th className="px-4 py-3 text-center">Actif</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(products ?? []).map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {CATEGORY_LABELS[p.category as ProductCategory] ?? p.category}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatDZD(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <form className="flex items-center gap-1 justify-center"
                      action={async (fd: FormData) => {
                        "use server";
                        await updateStock(p.id, Number(fd.get("stock")));
                      }}>
                      <input
                        name="stock"
                        type="number"
                        defaultValue={p.stock}
                        min={0}
                        className={`w-16 border rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-shifaa-green/50
                          ${p.stock === 0 ? "border-red-300 bg-red-50" : p.stock <= 5 ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}
                      />
                      <button type="submit" className="text-xs text-shifaa-green hover:underline">✓</button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    ⭐ {p.rating} <span className="text-gray-400">({p.review_count})</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {p.is_new && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Nouveau</span>}
                      {p.is_best_seller && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Best</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form action={async () => {
                      "use server";
                      await toggleProduct(p.id, !p.is_active);
                    }}>
                      <button type="submit"
                        className={`w-9 h-5 rounded-full transition-colors relative ${p.is_active ? "bg-shifaa-green" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a href={`/produit/${p.slug}`} target="_blank"
                      className="text-xs text-gray-400 hover:text-shifaa-green">Voir →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}&q=${params.q ?? ""}&category=${params.category ?? ""}&stock=${params.stock ?? ""}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">← Précédent</a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}&q=${params.q ?? ""}&category=${params.category ?? ""}&stock=${params.stock ?? ""}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Suivant →</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
