import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination } from "@/components/CatalogPagination";
import { CatalogFilters } from "@/components/CatalogFilters";
import { getProducts } from "@/lib/products-db";
import Link from "next/link";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promotions",
  description: "Réductions temporaires, lots et offres découverte sur produits parapharmaceutiques.",
};

const PAGE_SIZE = 12;

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);

  const { products, total, totalPages } = await getProducts({
    prixMax: params["prix-max"] ? Number(params["prix-max"]) : undefined,
    prixMin: params["prix-min"] ? Number(params["prix-min"]) : undefined,
    categorie: params.categorie as never ?? undefined,
    marque: params.marque ?? undefined,
    tri: (params.tri as never) ?? "remise-desc",
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const onSale = products.filter((p) => p.compareAtPrice);

  return (
    <>
      {/* Header page */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Breadcrumb items={[{ label: "Promotions" }]} />
          <div className="mt-2 flex items-center gap-3">
            <Tag className="h-6 w-6 text-red-500" />
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink">Promotions</h1>
          </div>
          <p className="mt-1 text-shifaa-muted">
            Réductions temporaires, coffrets et offres saisonnières · Prix en DZD TTC
          </p>
        </div>
      </div>

      {/* Layout sidebar + contenu */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Sidebar filtres ── */}
          <aside className="w-full shrink-0 lg:w-64 xl:w-72">
            <div className="sticky top-[var(--header-height,180px)] rounded-2xl border border-shifaa-border bg-white p-5">
              <CatalogFilters mode="promotions" basePath="/promotions" />
            </div>
          </aside>

          {/* ── Contenu principal ── */}
          <div className="flex-1 min-w-0">
            {/* Stats */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-shifaa-muted">
                <span className="font-semibold text-shifaa-ink">{total}</span> produits ·{" "}
                <span className="font-medium text-red-600">{onSale.length} en promotion</span>
                {currentPage > 1 && <span> · page {currentPage}/{totalPages}</span>}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Offres limitées
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
              {onSale.length === 0 ? (
                <div className="rounded-2xl border border-shifaa-border bg-white p-12 text-center">
                  <p className="text-3xl mb-3">🎁</p>
                  <p className="font-medium text-shifaa-ink">Aucune promotion en cours</p>
                  <p className="mt-1 text-sm text-shifaa-muted">Revenez bientôt pour découvrir nos offres</p>
                  <Link href="/boutique" className="mt-4 inline-block text-sm font-medium text-shifaa-green hover:underline">
                    Voir tout le catalogue →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {onSale.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                  <CatalogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchParams={{ ...params, page: String(currentPage) }}
                    basePath="/promotions"
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
