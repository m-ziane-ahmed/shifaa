import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marques | Admin Shifaa" };

async function toggleBrand(id: string, active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("brands").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/marques");
}

async function toggleFeatured(id: string, featured: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("brands").update({ is_featured: featured }).eq("id", id);
  revalidatePath("/admin/marques");
}

export default async function AdminMarquesPage() {
  const supabase = createAdminClient();

  const { data: brands } = await supabase
    .from("brands")
    .select(`
      *,
      brand_categories(
        is_primary,
        categories_v4(name_fr, name_ar, slug_fr)
      )
    `)
    .order("display_order");

  const total        = (brands ?? []).length;
  const activeCount  = (brands ?? []).filter((b) => b.is_active).length;
  const localCount   = (brands ?? []).filter((b) => b.is_local).length;
  const featuredCount = (brands ?? []).filter((b) => b.is_featured).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marques</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} marque{total > 1 ? "s" : ""} · {localCount} algérienne{localCount > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/marques/nouvelle"
          className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark transition">
          + Nouvelle marque
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400">Total marques</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
          <p className="text-xs text-green-400">Actives</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-700">{localCount}</p>
          <p className="text-xs text-blue-400">🇩🇿 Algériennes</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-amber-700">{featuredCount}</p>
          <p className="text-xs text-amber-400">⭐ Vedettes</p>
        </div>
      </div>

      {/* Grille marques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands ?? []).map((brand) => {
          const brandCats = (brand.brand_categories ?? []) as Array<{
            is_primary: boolean;
            categories_v4: { name_fr: string; name_ar: string; slug_fr: string } | null;
          }>;
          const primaryCat = brandCats.find((bc) => bc.is_primary)?.categories_v4;
          const allCats = brandCats
            .map((bc) => bc.categories_v4?.name_fr)
            .filter(Boolean)
            .slice(0, 3);

          return (
            <div key={brand.id}
              className={`bg-white rounded-2xl border p-5 transition
                ${brand.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>

              {/* En-tête marque */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name}
                      width={48} height={48}
                      className="h-12 w-12 rounded-xl object-contain border border-gray-100 bg-gray-50 p-1" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-shifaa-green/20 to-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-shifaa-green">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    {brand.name_ar && (
                      <p className="text-sm text-gray-400 font-arabic" dir="rtl">{brand.name_ar}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {brand.is_local && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">🇩🇿 Local</span>
                  )}
                  {brand.is_featured && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">⭐ Vedette</span>
                  )}
                  {brand.is_certified && (
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">✓ Certifié</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="font-medium text-gray-800">{brand.product_count} produits</span>
                {brand.avg_rating > 0 && (
                  <span>⭐ {brand.avg_rating.toFixed(1)}</span>
                )}
                {primaryCat && (
                  <span className="text-shifaa-green truncate">{primaryCat.name_fr}</span>
                )}
              </div>

              {/* Catégories */}
              {allCats.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {allCats.map((cat) => (
                    <span key={cat} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {cat}
                    </span>
                  ))}
                  {brandCats.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{brandCats.length - 3}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  {/* Toggle actif */}
                  <form action={async () => { "use server"; await toggleBrand(brand.id, !brand.is_active); }}>
                    <button type="submit"
                      className={`relative w-8 h-4.5 rounded-full transition-colors ${brand.is_active ? "bg-shifaa-green" : "bg-gray-200"}`}
                      style={{ height: "1.125rem" }}>
                      <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
                        ${brand.is_active ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </button>
                  </form>
                  {/* Toggle vedette */}
                  <form action={async () => { "use server"; await toggleFeatured(brand.id, !brand.is_featured); }}>
                    <button type="submit"
                      className={`text-xs px-2 py-0.5 rounded-lg border transition
                        ${brand.is_featured ? "border-amber-300 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-400 hover:border-amber-300"}`}>
                      ⭐
                    </button>
                  </form>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/marques/${brand.slug}`}
                    className="text-xs text-shifaa-green hover:underline font-medium">
                    Fiche →
                  </Link>
                  <Link href={`/admin/marques/${brand.slug}/editer`}
                    className="text-xs text-gray-400 hover:text-gray-600">
                    Modifier
                  </Link>
                  <a href={`/boutique?brand=${brand.slug}`} target="_blank"
                    className="text-xs text-gray-300 hover:text-gray-500">
                    Site ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
