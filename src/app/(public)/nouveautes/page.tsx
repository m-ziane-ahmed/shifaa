import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination } from "@/components/CatalogPagination";
import { CatalogFilters } from "@/components/CatalogFilters";
import { getProducts } from "@/lib/products-db";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nouveautés",
  description: "Les derniers produits ajoutés à notre catalogue parapharmaceutique.",
};

const PAGE_SIZE = 12;

export default async function NouveautesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);
  const currentCat = params.categorie as ProductCategory | undefined;

  const { products, total, totalPages } = await getProducts({
    categorie: currentCat ?? undefined,
    marque: params.marque ?? undefined,
    prixMax: params["prix-max"] ? Number(params["prix-max"]) : undefined,
    prixMin: params["prix-min"] ? Number(params["prix-min"]) : undefined,
    tri: (params.tri as never) ?? "nouveaute",
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const catLabel = currentCat ? CATEGORY_LABELS[currentCat] : null;

  return (
    <>
      {/* Header page */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Breadcrumb items={[
            ...(catLabel
              ? [{ label: "Nouveautés", href: "/nouveautes" }, { label: catLabel }]
              : [{ label: "Nouveautés" }]
            )
          ]} />
          <div className="mt-2 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink">
              {catLabel ? `Nouveautés — ${catLabel}` : "Nouveautés"}
            </h1>
          </div>
          <p className="mt-1 text-shifaa-muted">
            Les derniers produits ajoutés à notre catalogue parapharmaceutique
          </p>
        </div>
      </div>

      {/* Layout sidebar + contenu */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Sidebar filtres ── */}
          <aside className="w-full shrink-0 lg:w-64 xl:w-72">
            <div className="sticky top-[var(--header-height,180px)] rounded-2xl border border-shifaa-border bg-white p-5">
              <CatalogFilters mode="nouveautes" basePath="/nouveautes" />
            </div>
          </aside>

          {/* ── Contenu principal ── */}
          <div className="flex-1 min-w-0">
            {/* Stats */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-shifaa-muted">
                <span className="font-semibold text-shifaa-ink">{total}</span> produit{total > 1 ? "s" : ""}
                {catLabel && <span> dans <span className="text-shifaa-green">{catLabel}</span></span>}
                {currentPage > 1 && <span> · page {currentPage}/{totalPages}</span>}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <Sparkles className="h-3 w-3" />
                Nouveautés
              </span>
            </div>

            {/* Grille */}
            <Suspense fallback={
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white animate-pulse border border-shifaa-border" />
                ))}
              </div>
            }>
              {products.length === 0 ? (
                <div className="rounded-2xl border border-shifaa-border bg-white p-12 text-center">
                  <p className="text-3xl mb-3">✨</p>
                  <p className="font-medium text-shifaa-ink">Aucune nouveauté avec ces critères</p>
                  <p className="mt-1 text-sm text-shifaa-muted">Essayez d&apos;élargir vos filtres</p>
                  <Link href="/nouveautes" className="mt-4 inline-block text-sm font-medium text-shifaa-green hover:underline">
                    Voir toutes les nouveautés →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                  <CatalogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchParams={{ ...params, page: String(currentPage) }}
                    basePath="/nouveautes"
                  />
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
