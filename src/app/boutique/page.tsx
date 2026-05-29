import { Suspense } from "react";
import { BoutiqueFilters } from "@/components/BoutiqueFilters";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { MobileFilterSheet } from "@/components/MobileFilterSheet";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination, getPaginationParams } from "@/components/CatalogPagination";
import { getProducts } from "@/lib/products-db";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Boutique",
  description: "Catalogue parapharmacie — plus de 1500 références avec filtres et livraison nationale.",
};

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageSize = 12;

  const rawPage = typeof params.page === "string" ? parseInt(params.page) : 1;
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { products, total, totalPages } = await getProducts({
    q: typeof params.q === "string" ? params.q : undefined,
    categorie: typeof params.categorie === "string" ? params.categorie : undefined,
    marque: typeof params.marque === "string" ? params.marque : undefined,
    prixMax: params["prix-max"] ? Number(params["prix-max"]) : undefined,
    stock: params.stock === "1",
    tri: typeof params.tri === "string" ? params.tri : undefined,
    peau: typeof params.peau === "string" ? params.peau : undefined,
    format: typeof params.format === "string" ? params.format : undefined,
    age: typeof params.age === "string" ? params.age : undefined,
    besoin: typeof params.besoin === "string" ? params.besoin : undefined,
    page: currentPage,
    pageSize,
  });

  const catLabel =
    typeof params.categorie === "string"
      ? CATEGORY_LABELS[params.categorie as ProductCategory]
      : null;

  const { totalPages: computedTotalPages } = getPaginationParams(params, total);

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
            </Suspense>
            <p className="mb-6 text-sm text-shifaa-muted">
              {total} produit{total !== 1 ? "s" : ""} au catalogue
              {typeof params.q === "string" && params.q ? ` pour « ${params.q} »` : ""}
              {total > 0 && (
                <> · page {currentPage}/{totalPages}</>
              )}
            </p>
            {products.length === 0 ? (
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
