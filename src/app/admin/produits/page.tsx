import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";

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

const CATALOG_SCORE = (p: {
  name?: string; short_description?: string; description?: string;
  images?: string[]; price?: number; sku?: string; meta_title?: string;
  meta_description?: string; benefits?: string[]; ingredients?: string;
}) => {
  let s = 0;
  if (p.name && p.name.length > 5) s += 15;
  if (p.short_description && p.short_description.length > 20) s += 10;
  if (p.description && p.description.length > 100) s += 15;
  if (p.images && p.images.length > 0) s += 20;
  if (p.images && p.images.length >= 3) s += 5;
  if (p.price && p.price > 0) s += 10;
  if (p.sku) s += 5;
  if (p.ingredients && p.ingredients.length > 10) s += 5;
  if (p.meta_title) s += 5;
  if (p.meta_description) s += 5;
  if (p.benefits && p.benefits.length > 0) s += 5;
  return Math.min(s, 100);
};

export default async function AdminProduits({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 25;

  let query = supabase
    .from("products")
    .select("id, slug, name, brand, category, price, cost_price, stock, stock_min, stock_safety, is_active, is_new, is_best_seller, rating, review_count, status, images, sku, short_description, description, meta_title, meta_description, benefits, ingredients", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.q) query = query.or(`name.ilike.%${params.q}%,brand.ilike.%${params.q}%,sku.ilike.%${params.q}%`);
  if (params.category) query = query.eq("category", params.category);
  if (params.stock === "out")      query = query.eq("stock", 0);
  if (params.stock === "low")      query = query.gt("stock", 0).lte("stock", 5);
  if (params.status === "draft")   query = query.eq("status", "draft");
  if (params.status === "published") query = query.eq("status", "published");
  if (params.status === "archived") query = query.eq("status", "archived");

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  // KPIs globaux
  const { data: allStats } = await supabase.from("products")
    .select("is_active, stock, status, price");
  const totalActive = (allStats ?? []).filter((p) => p.is_active).length;
  const totalOut    = (allStats ?? []).filter((p) => p.stock === 0).length;
  const totalDraft  = (allStats ?? []).filter((p) => p.status === "draft").length;

  const STOCK_FILTERS = [
    { value: "", label: "Tout stock" },
    { value: "out", label: "Rupture" },
    { value: "low", label: "Stock faible" },
  ];
  const STATUS_FILTERS = [
    { value: "", label: "Tous statuts" },
    { value: "published", label: "Publiés" },
    { value: "draft", label: "Brouillons" },
    { value: "archived", label: "Archivés" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue produits</h1>
          <p className="text-sm text-gray-400 mt-0.5">{count ?? 0} produit{(count ?? 0) > 1 ? "s" : ""} trouvé{(count ?? 0) > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/export/products"
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ⬇ Export
          </a>
          <a href="/admin/import"
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ⬆ Import
          </a>
          <Link href="/admin/produits/nouveau"
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark transition-colors shadow-sm">
            + Nouveau produit
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xl font-bold text-gray-900">{totalActive}</p>
          <p className="text-xs text-gray-400">Produits actifs</p>
        </div>
        <div className={`rounded-2xl border p-4 ${totalOut > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-xl font-bold ${totalOut > 0 ? "text-red-600" : "text-gray-400"}`}>{totalOut}</p>
          <p className={`text-xs ${totalOut > 0 ? "text-red-400" : "text-gray-400"}`}>Ruptures</p>
        </div>
        <div className={`rounded-2xl border p-4 ${totalDraft > 0 ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-xl font-bold ${totalDraft > 0 ? "text-amber-700" : "text-gray-400"}`}>{totalDraft}</p>
          <p className={`text-xs ${totalDraft > 0 ? "text-amber-400" : "text-gray-400"}`}>Brouillons</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <form className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={params.q} placeholder="🔍 Nom, marque, SKU…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
          <select name="category" defaultValue={params.category}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30">
            <option value="">Toutes catégories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select name="stock" defaultValue={params.stock}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {STOCK_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select name="status" defaultValue={params.status}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button type="submit"
            className="bg-shifaa-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-shifaa-dark transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Produit", "Catégorie", "Prix / Marge", "Stock", "Score", "Statut", "Actif", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              )}
              {(products ?? []).map((p) => {
                const score = CATALOG_SCORE(p);
                const scoreColor = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-red-400";
                const scoreText = score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
                const margin = p.cost_price && p.price
                  ? Math.round(((p.price - p.cost_price) / p.price) * 100)
                  : null;
                const stockStatus = p.stock === 0
                  ? { cls: "text-red-600 font-bold", bg: "border-red-300 bg-red-50" }
                  : p.stock <= (p.stock_safety ?? 5)
                  ? { cls: "text-orange-600 font-bold", bg: "border-orange-300 bg-orange-50" }
                  : p.stock <= (p.stock_min ?? 10)
                  ? { cls: "text-amber-600 font-semibold", bg: "border-amber-300 bg-amber-50" }
                  : { cls: "text-gray-700", bg: "border-gray-200" };

                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.is_active ? "opacity-50" : ""}`}>
                    {/* Produit */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt="" width={36} height={36}
                            className="h-9 w-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-300 text-xs">📦</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</p>
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {CATEGORY_LABELS[p.category as ProductCategory] ?? p.category}
                    </td>

                    {/* Prix / Marge */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{formatDZD(p.price)}</p>
                      {margin !== null && (
                        <p className={`text-xs font-medium ${margin >= 30 ? "text-green-600" : margin >= 15 ? "text-amber-600" : "text-red-500"}`}>
                          Marge {margin}%
                        </p>
                      )}
                    </td>

                    {/* Stock inline éditable */}
                    <td className="px-4 py-3">
                      <form className="flex items-center gap-1"
                        action={async (fd: FormData) => {
                          "use server";
                          await updateStock(p.id, Number(fd.get("stock")));
                        }}>
                        <input name="stock" type="number" defaultValue={p.stock} min={0}
                          className={`w-14 border rounded-lg px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-shifaa-green/50 ${stockStatus.bg}`} />
                        <button type="submit" className="text-[10px] text-shifaa-green hover:underline">✓</button>
                      </form>
                      <p className={`text-[10px] mt-0.5 ${stockStatus.cls}`}>
                        {p.stock === 0 ? "Rupture" : p.stock <= (p.stock_safety ?? 5) ? "Critique" : p.stock <= (p.stock_min ?? 10) ? "Faible" : ""}
                      </p>
                    </td>

                    {/* Score catalogue */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${scoreText}`}>{score}</span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium
                        ${p.status === "published" ? "bg-green-100 text-green-700"
                          : p.status === "draft" ? "bg-gray-100 text-gray-500"
                          : "bg-red-100 text-red-600"}`}>
                        {p.status === "published" ? "Publié" : p.status === "draft" ? "Brouillon" : "Archivé"}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {p.is_new && <span className="text-[9px] bg-blue-100 text-blue-600 px-1 rounded">Nouveau</span>}
                        {p.is_best_seller && <span className="text-[9px] bg-amber-100 text-amber-600 px-1 rounded">Best</span>}
                      </div>
                    </td>

                    {/* Toggle actif */}
                    <td className="px-4 py-3">
                      <form action={async () => {
                        "use server";
                        await toggleProduct(p.id, !p.is_active);
                      }}>
                        <button type="submit"
                          className={`relative w-9 h-5 rounded-full transition-colors ${p.is_active ? "bg-shifaa-green" : "bg-gray-200"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${p.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </form>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Link href={`/admin/produits/${p.id}`}
                          className="text-xs text-shifaa-green hover:underline font-medium">
                          Fiche →
                        </Link>
                        <Link href={`/admin/produits/${p.id}/editer`}
                          className="text-xs text-gray-400 hover:text-gray-600">
                          Modifier
                        </Link>
                        <a href={`/produit/${p.slug}`} target="_blank"
                          className="text-xs text-gray-300 hover:text-gray-500">
                          Site ↗
                        </a>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} / {totalPages} · {count} produits</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}&q=${params.q ?? ""}&category=${params.category ?? ""}&stock=${params.stock ?? ""}&status=${params.status ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">← Précédent</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}&q=${params.q ?? ""}&category=${params.category ?? ""}&stock=${params.stock ?? ""}&status=${params.status ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Suivant →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
