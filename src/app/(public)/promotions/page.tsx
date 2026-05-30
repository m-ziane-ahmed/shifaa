import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination } from "@/components/CatalogPagination";
import { getProducts } from "@/lib/products-db";
import Link from "next/link";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promotions",
  description: "Réductions temporaires, lots et offres découverte sur produits parapharmaceutiques.",
};

const OPERATIONS = [
  { slug: "toutes", label: "Toutes les offres", color: "bg-shifaa-green text-white" },
  { slug: "ete", label: "🌞 Été", color: "bg-amber-100 text-amber-800" },
  { slug: "rentree", label: "📚 Rentrée", color: "bg-blue-100 text-blue-800" },
  { slug: "fetes", label: "🎁 Fêtes", color: "bg-purple-100 text-purple-800" },
  { slug: "flash", label: "⚡ Vente flash", color: "bg-red-100 text-red-800" },
  { slug: "fidélité", label: "⭐ Fidélité", color: "bg-shifaa-lime/40 text-shifaa-ink" },
];

const PAGE_SIZE = 12;

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ op?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentOp = params.op ?? "toutes";
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);

  const { products, total, totalPages } = await getProducts({
    prixMax: undefined,
    tri: "prix-asc",
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  // Filtrer les produits en promo (avec compareAtPrice)
  const onSale = products.filter((p) => p.compareAtPrice);
  const totalOnSale = onSale.length;

  return (
    <>
      {/* Header */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <Breadcrumb items={[{ label: "Promotions" }]} />
          <div className="mt-2 flex items-center gap-3">
            <Tag className="h-6 w-6 text-shifaa-green" />
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink">Promotions</h1>
          </div>
          <p className="mt-2 text-shifaa-muted">
            Réductions temporaires, coffrets et offres saisonnières · Prix en DZD TTC
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        {/* Bandeau opérations */}
        <div className="mb-8 rounded-2xl border border-shifaa-border bg-white p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-shifaa-muted">
            Filtrer par opération
          </p>
          <div className="flex flex-wrap gap-2">
            {OPERATIONS.map((op) => {
              const isActive = currentOp === op.slug;
              return (
                <Link
                  key={op.slug}
                  href={`/promotions?op=${op.slug}&page=1`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-shifaa-green text-white border-transparent shadow-md scale-105"
                      : "border-shifaa-border bg-white text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
                  }`}
                >
                  {op.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-shifaa-muted">
            <span className="font-semibold text-shifaa-ink">{total}</span> produits ·{" "}
            <span className="text-shifaa-green font-medium">{totalOnSale} en promotion</span>
            {currentPage > 1 && <span> · page {currentPage}/{totalPages}</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Offres limitées
            </span>
          </div>
        </div>

        {/* Grille produits */}
        <Suspense fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {onSale.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={{ op: currentOp, page: String(currentPage) }}
                basePath="/promotions"
              />
            </>
          )}
        </Suspense>
      </div>
    </>
  );
}
