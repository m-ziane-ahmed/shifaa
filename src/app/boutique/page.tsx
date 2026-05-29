import { Suspense } from "react";
import { BoutiqueFilters } from "@/components/BoutiqueFilters";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { MobileFilterSheet } from "@/components/MobileFilterSheet";import { ComplianceBanner } from "@/components/ComplianceBanner";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination, getPaginationParams } from "@/components/CatalogPagination";
import { PRODUCTS } from "@/data/products";
import { CATEGORY_LABELS } from "@/data/categories";
import type { Product, ProductCategory } from "@/lib/types";

export const metadata = {
  title: "Boutique",
  description: "Catalogue parapharmacie — plus de 1500 références avec filtres et livraison nationale.",
};

function filterProducts(searchParams: { [key: string]: string | string[] | undefined }): Product[] {
  let list = [...PRODUCTS];
  const q = typeof searchParams.q === "string" ? searchParams.q.toLowerCase() : "";
  const cat = searchParams.categorie as ProductCategory | undefined;
  const marque = searchParams.marque as string | undefined;
  const prixMax = searchParams["prix-max"] ? Number(searchParams["prix-max"]) : undefined;
  const stock = searchParams.stock === "1";
  const tri = searchParams.tri as string | undefined;
  const wilaya = searchParams.wilaya as string | undefined;
  const peau = searchParams.peau as string | undefined;
  const format = searchParams.format as string | undefined;
  const age = searchParams.age as string | undefined;
  const besoin = searchParams.besoin as string | undefined;

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }
  if (cat && CATEGORY_LABELS[cat]) list = list.filter((p) => p.category === cat);
  if (marque) list = list.filter((p) => p.brand === marque);
  if (prixMax) list = list.filter((p) => p.price <= prixMax);
  if (stock) list = list.filter((p) => p.inStock);
  if (wilaya) list = list.filter((p) => !p.wilayas?.length || p.wilayas.includes(wilaya));
  if (peau) list = list.filter((p) => p.skinType?.includes(peau));
  if (format) list = list.filter((p) => p.format === format);
  if (age) list = list.filter((p) => p.ageGroup === age);
  if (besoin) list = list.filter((p) => p.need === besoin);

  switch (tri) {
    case "prix-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "prix-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "avis":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "nouveaute":
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  return list;
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filtered = filterProducts(params);
  const { currentPage, totalPages, start, pageSize } = getPaginationParams(params, filtered.length);
  const products = filtered.slice(start, start + pageSize);
  const catLabel =
    typeof params.categorie === "string" ? CATEGORY_LABELS[params.categorie as ProductCategory] : null;

  return (
    <>
      <PageHeader
        title={catLabel ? catLabel : "Boutique"}
        description="Plus de 1 500 références parapharmaceutiques. Filtrez par catégorie, marque, prix en DZD, disponibilité et wilaya de livraison."
      />
      <ComplianceBanner compact />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="hidden lg:block lg:w-56 shrink-0">
            <Suspense fallback={<p className="text-sm text-shifaa-muted">Chargement des filtres…</p>}>
              <BoutiqueFilters />
            </Suspense>
          </div>
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-4 lg:justify-between">
              <div className="hidden flex-1 lg:block">
                <Suspense fallback={null}>
                  <ActiveFilterChips />
                </Suspense>
              </div>
              <MobileFilterSheet />
            </div>
            <Suspense fallback={null}>
              <div className="mb-4 lg:hidden">
                <ActiveFilterChips />
              </div>
            </Suspense>            <p className="mb-6 text-sm text-shifaa-muted">
              {filtered.length} produit{filtered.length !== 1 ? "s" : ""} au catalogue
              {typeof params.q === "string" && params.q ? ` pour « ${params.q} »` : ""}
              {filtered.length > 0 && (
                <>
                  {" "}
                  · page {currentPage}/{totalPages}
                </>
              )}
            </p>
            {filtered.length === 0 ? (
              <div className="card-surface p-12 text-center">
                <p className="text-shifaa-muted">Aucun produit ne correspond à vos critères.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <CatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchParams={params}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
