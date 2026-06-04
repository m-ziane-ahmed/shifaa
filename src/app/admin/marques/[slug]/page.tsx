import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { extractRelation } from "@/lib/supabase-helpers";

export const dynamic = "force-dynamic";

async function deleteBrand(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("brand_categories").delete().eq("brand_id", id);
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/marques");
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase  = createAdminClient();

  const { data: brand } = await supabase
    .from("brands")
    .select(`
      *,
      brand_categories(
        id, is_primary,
        categories_v4(id, name_fr, name_ar, slug_fr)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!brand) notFound();

  // Produits de cette marque
  const { data: products, count: productCount } = await supabase
    .from("products")
    .select("id, name, price, stock, status, images, category, is_active", { count: "exact" })
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const brandCats = (brand.brand_categories ?? []) as Array<{
    id: string; is_primary: boolean;
    categories_v4: { id: string; name_fr: string; name_ar: string; slug_fr: string } | null;
  }>;

  const totalStock = (products ?? []).reduce((s, p) => s + (p.stock ?? 0), 0);
  const pubCount   = (products ?? []).filter((p) => p.status === "published").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/marques" className="text-sm text-gray-400 hover:text-gray-600">← Marques</Link>
          <span className="text-gray-200">/</span>
          <div className="flex items-center gap-3">
            {brand.logo_url ? (
              <Image src={brand.logo_url} alt={brand.name} width={40} height={40}
                className="h-10 w-10 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-shifaa-green/10 flex items-center justify-center">
                <span className="text-lg font-bold text-shifaa-green">{brand.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
              {brand.name_ar && <p className="text-sm text-gray-400" dir="rtl">{brand.name_ar}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/boutique?brand=${brand.slug}`} target="_blank"
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
            ↗ Voir boutique
          </a>
          <Link href={`/admin/marques/${brand.slug}/editer`}
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark">
            ✏️ Modifier
          </Link>
          <form action={async () => {
            "use server";
            await deleteBrand(brand.id);
          }}>
            <button type="submit"
              className="px-3 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition"
              onClick={(e) => {
                if (!confirm(`Supprimer "${brand.name}" ? Cette action est irréversible.`)) e.preventDefault();
              }}>
              🗑️ Supprimer
            </button>
          </form>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-shifaa-green">{productCount ?? 0}</p>
          <p className="text-xs text-gray-400">Produits liés</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{pubCount}</p>
          <p className="text-xs text-gray-400">Publiés</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Unités en stock</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-amber-600">
            {brand.avg_rating ? brand.avg_rating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-400">Note moyenne ⭐</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Informations */}
        <div className="lg:col-span-1 space-y-4">

          {/* Identité */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Identité</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Slug</span>
                <span className="font-mono text-xs text-gray-600">{brand.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pays</span>
                <span>{brand.country_origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ordre</span>
                <span>{brand.display_order}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${brand.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {brand.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {brand.is_local    && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">🇩🇿 Local</span>}
              {brand.is_featured && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">⭐ Vedette</span>}
              {brand.is_certified && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✓ {brand.certification_label || "Certifiée"}</span>}
            </div>
          </div>

          {/* Catégories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Catégories ({brandCats.length})</h2>
            <div className="space-y-2">
              {brandCats.map((bc) => {
                const cat = extractRelation<{ name_fr: string; name_ar: string }>(bc.categories_v4);
                return (
                  <div key={bc.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">{cat?.name_fr ?? "—"}</p>
                      <p className="text-xs text-gray-400" dir="rtl">{cat?.name_ar}</p>
                    </div>
                    {bc.is_primary && (
                      <span className="text-[10px] bg-shifaa-green text-white px-1.5 py-0.5 rounded">★ Principale</span>
                    )}
                  </div>
                );
              })}
              {brandCats.length === 0 && <p className="text-xs text-gray-400">Aucune catégorie liée</p>}
            </div>
          </div>

          {/* Descriptions */}
          {(brand.description_fr || brand.description_ar) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
              {brand.description_fr && <p className="text-sm text-gray-600 mb-3">{brand.description_fr}</p>}
              {brand.description_ar && <p className="text-sm text-gray-600 text-right" dir="rtl">{brand.description_ar}</p>}
            </div>
          )}

          {/* SEO */}
          {(brand.meta_title_fr || brand.meta_desc_fr) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">SEO</h2>
              {brand.meta_title_fr && (
                <div className="mb-2">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Titre FR</p>
                  <p className="text-sm text-blue-600">{brand.meta_title_fr}</p>
                </div>
              )}
              {brand.meta_desc_fr && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Description FR</p>
                  <p className="text-xs text-gray-500">{brand.meta_desc_fr}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Produits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Produits liés
                <span className="ml-2 text-xs text-gray-400 font-normal">{productCount ?? 0} au total</span>
              </h2>
              <Link href={`/admin/produits?brand=${brand.slug}`}
                className="text-xs text-shifaa-green hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(products ?? []).length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-2xl mb-2">📦</p>
                  <p className="text-sm text-gray-400">Aucun produit lié</p>
                  <Link href="/admin/produits/nouveau"
                    className="mt-2 inline-block text-xs text-shifaa-green hover:underline">
                    + Créer un produit pour cette marque
                  </Link>
                </div>
              ) : (products ?? []).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt="" width={40} height={40}
                      className="h-10 w-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-300 text-xs">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-800">{p.price?.toLocaleString()} DZD</p>
                    <p className={`text-xs ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-500" : "text-green-600"}`}>
                      {p.stock} unités
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                  <Link href={`/admin/produits/${p.id}`}
                    className="shrink-0 text-xs text-shifaa-green hover:underline">→</Link>
                </div>
              ))}
            </div>
            {(productCount ?? 0) > 12 && (
              <div className="px-5 py-3 border-t border-gray-100 text-center">
                <Link href={`/admin/produits?brand_id=${brand.id}`}
                  className="text-xs text-shifaa-green hover:underline">
                  Voir les {(productCount ?? 0) - 12} autres produits →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
