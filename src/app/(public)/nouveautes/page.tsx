import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination } from "@/components/CatalogPagination";
import { getProducts } from "@/lib/products-db";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nouveautés",
  description: "Les derniers produits ajoutés à notre catalogue parapharmaceutique.",
};

const UNIVERS: { slug: ProductCategory | "tous"; label: string; icon: string }[] = [
  { slug: "tous", label: "Tout voir", icon: "✨" },
  { slug: "visage-peau", label: "Visage & peau", icon: "🌸" },
  { slug: "corps-hygiene", label: "Corps & hygiène", icon: "🫧" },
  { slug: "cheveux", label: "Cheveux", icon: "💇" },
  { slug: "bebe-maternite", label: "Bébé", icon: "👶" },
  { slug: "complements", label: "Compléments", icon: "🌿" },
  { slug: "bien-etre", label: "Bien-être", icon: "☀️" },
  { slug: "dispositifs", label: "Dispositifs", icon: "🩺" },
  { slug: "bio-naturel", label: "Bio & naturel", icon: "🍃" },
];

const PAGE_SIZE = 12;

export default async function NouveautesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentCat = (params.cat ?? "tous") as ProductCategory | "tous";
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);

  const { products, total, totalPages } = await getProducts({
    categorie: currentCat !== "tous" ? currentCat : undefined,
    tri: "nouveaute",
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const catLabel = currentCat !== "tous"
    ? CATEGORY_LABELS[currentCat as ProductCategory]
    : null;

  return (
    <>
      {/* Header */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <Breadcrumb items={[
            ...(catLabel
              ? [{ label: "Nouveautés", href: "/nouveautes" }, { label: catLabel }]
              : [{ label: "Nouveautés" }]
            )
          ]} />
          <div className="mt-2 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-shifaa-green" />
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink">
              {catLabel ? `Nouveautés — ${catLabel}` : "Nouveautés"}
            </h1>
          </div>
          <p className="mt-2 text-shifaa-muted">
            Les derniers produits ajoutés à notre catalogue parapharmaceutique
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        {/* Bandeau univers / catégories */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max md:flex-wrap md:min-w-0">
            {UNIVERS.map((u) => {
              const isActive = currentCat === u.slug;
              return (
                <Link
                  key={u.slug}
                  href={u.slug === "tous" ? "/nouveautes?page=1" : `/nouveautes?cat=${u.slug}&page=1`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-shifaa-green text-white border-transparent shadow-md"
                      : "border-shifaa-border bg-white text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
                  }`}
                >
                  <span>{u.icon}</span>
                  {u.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
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

        {/* Grille produits */}
        <Suspense fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white animate-pulse border border-shifaa-border" />
            ))}
          </div>
        }>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-shifaa-border bg-white p-12 text-center">
              <p className="text-3xl mb-3">✨</p>
              <p className="font-medium text-shifaa-ink">Aucune nouveauté dans cette catégorie</p>
              <Link href="/nouveautes" className="mt-4 inline-block text-sm font-medium text-shifaa-green hover:underline">
                Voir toutes les nouveautés →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={{ cat: currentCat !== "tous" ? currentCat : "", page: String(currentPage) }}
                basePath="/nouveautes"
              />
            </>
          )}
        </Suspense>
      </div>
    </>
  );
}
