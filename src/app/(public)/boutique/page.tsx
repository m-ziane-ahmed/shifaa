import { Suspense } from "react";
import { BoutiqueFilters } from "@/components/BoutiqueFilters";
import { MobileFilterSheet } from "@/components/MobileFilterSheet";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BoutiqueClient } from "@/components/BoutiqueClient";
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

  const breadcrumbItems = [
    { label: "Boutique", href: "/boutique" },
    ...(catLabel ? [{ label: catLabel }] : []),
    ...(params.q ? [{ label: `"${params.q}"` }] : []),
  ];

  return (
    <>
      <ComplianceBanner compact />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        {/* Titre page */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-semibold text-shifaa-ink">
            {catLabel ?? (params.q ? `Résultats pour "${params.q}"` : "Boutique")}
          </h1>
          <p className="text-sm text-shifaa-muted mt-1">
            Plus de 1 500 références parapharmaceutiques · Livraison nationale
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar filtres desktop */}
          <aside className="hidden lg:block lg:w-60 shrink-0">
            <div className="sticky top-24 card-surface p-4">
              <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-shifaa-cream" />}>
                <BoutiqueFilters />
              </Suspense>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Filtres mobile */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <p className="text-sm text-shifaa-muted">
                <span className="font-medium text-shifaa-ink">{total}</span> produit{total !== 1 ? "s" : ""}
              </p>
              <Suspense fallback={null}>
                <MobileFilterSheet />
              </Suspense>
            </div>

            <Suspense fallback={
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-shifaa-cream animate-pulse" />
                ))}
              </div>
            }>
              <BoutiqueClient
                products={products}
                total={total}
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={params}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
