import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catégories | Admin Shifaa" };

async function toggleCategory(id: string, active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("categories_v4").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/categories");
}

async function deleteCategory(id: string) {
  "use server";
  const supabase = createAdminClient();
  // Vérifier si des produits utilisent cette catégorie
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category", id);
  if ((count ?? 0) > 0) return; // Ne pas supprimer si produits liés
  await supabase.from("categories_v4").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();

  const { data: allCats } = await supabase
    .from("categories_v4")
    .select("*")
    .order("level")
    .order("display_order");

  const roots = (allCats ?? []).filter((c) => !c.parent_id);
  const subs  = (allCats ?? []).filter((c) => !!c.parent_id);

  const totalRoots  = roots.length;
  const totalSubs   = subs.length;
  const totalActive = (allCats ?? []).filter((c) => c.is_active).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalRoots} catégories racines · {totalSubs} sous-catégories · {totalActive} actives
          </p>
        </div>
        <Link href="/admin/categories/nouvelle"
          className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark transition">
          + Nouvelle catégorie
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalRoots}</p>
          <p className="text-xs text-gray-400">Catégories principales</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-700">{totalSubs}</p>
          <p className="text-xs text-green-400">Sous-catégories</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-700">{totalActive}</p>
          <p className="text-xs text-blue-400">Actives</p>
        </div>
      </div>

      {/* Arborescence */}
      <div className="space-y-4">
        {roots.map((root) => {
          const children = subs.filter((s) => s.parent_id === root.id);
          return (
            <div key={root.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Catégorie racine */}
              <div className={`flex items-center gap-3 px-5 py-4 border-b border-gray-100 ${!root.is_active ? "opacity-50" : ""}`}>
                {root.icon && <span className="text-xl">{root.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{root.name_fr}</h3>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-sm text-gray-500" dir="rtl">{root.name_ar}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{root.slug_fr} · {children.length} sous-cat.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${root.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {root.is_active ? "Active" : "Inactive"}
                  </span>
                  <Link href={`/admin/categories/${root.id}/editer`}
                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:border-shifaa-green hover:text-shifaa-green">
                    ✏️ Modifier
                  </Link>
                  <form action={async () => { "use server"; await toggleCategory(root.id, !root.is_active); }}>
                    <button type="submit"
                      className={`relative w-8 rounded-full transition-colors ${root.is_active ? "bg-shifaa-green" : "bg-gray-200"}`}
                      style={{ height: "1.125rem" }}>
                      <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
                        ${root.is_active ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Sous-catégories */}
              {children.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {children.map((sub) => (
                    <div key={sub.id} className={`flex items-center gap-3 px-5 py-3 pl-12 hover:bg-gray-50 transition ${!sub.is_active ? "opacity-50" : ""}`}>
                      <div className="w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-sm shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">{sub.name_fr}</p>
                          <span className="text-xs text-gray-400">·</span>
                          <p className="text-xs text-gray-500" dir="rtl">{sub.name_ar}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">{sub.slug_fr}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sub.is_active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                          {sub.is_active ? "✓" : "—"}
                        </span>
                        <Link href={`/admin/categories/${sub.id}/editer`}
                          className="text-[10px] text-gray-400 hover:text-shifaa-green">
                          ✏️
                        </Link>
                        <form action={async () => { "use server"; await toggleCategory(sub.id, !sub.is_active); }}>
                          <button type="submit"
                            className={`relative rounded-full transition-colors ${sub.is_active ? "bg-shifaa-green" : "bg-gray-200"}`}
                            style={{ width: "1.5rem", height: "0.9rem" }}>
                            <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-transform
                              ${sub.is_active ? "translate-x-3" : "translate-x-0.5"}`} />
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await deleteCategory(sub.id);
                        }}>
                          <button type="submit"
                            className="text-[10px] text-gray-300 hover:text-red-500 transition"
                            title="Supprimer (uniquement si aucun produit lié)">
                            🗑
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ajouter sous-catégorie */}
              <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
                <Link href={`/admin/categories/nouvelle?parent_id=${root.id}`}
                  className="text-xs text-shifaa-green hover:underline">
                  + Ajouter une sous-catégorie
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
