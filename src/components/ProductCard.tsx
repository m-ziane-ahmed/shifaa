import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import { ProductQuickActions } from "@/components/ProductQuickActions";

function StockBadge({ inStock, stock }: { inStock: boolean; stock?: number }) {
  if (!inStock) return <p className="mt-2 text-xs font-medium text-amber-700">Rupture de stock</p>;
  if (stock !== undefined && stock <= 5)
    return <p className="mt-2 text-xs font-medium text-orange-600">⚠ Plus que {stock} en stock</p>;
  return null;
}

export function ProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "list" }) {
  const discount =
    product.compareAtPrice &&
    Math.round((1 - product.price / product.compareAtPrice) * 100);

  if (view === "list") {
    return (
      <article className="card-surface group flex gap-4 overflow-hidden transition hover:shadow-lift p-3">
        <Link href={`/produit/${product.slug}`} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-shifaa-cream">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="96px"
          />
          {product.isNew && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-shifaa-green px-1.5 py-0.5 text-[10px] font-medium text-white">
              Nouveau
            </span>
          )}
          {discount && (
            <span className="absolute right-1.5 bottom-1.5 rounded-full bg-shifaa-lime px-1.5 py-0.5 text-[10px] font-semibold text-shifaa-ink">
              -{discount}%
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-shifaa-muted">{product.brand}</p>
                <Link href={`/produit/${product.slug}`}>
                  <h3 className="mt-0.5 font-medium text-shifaa-ink hover:text-shifaa-green line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-0.5 text-xs text-shifaa-muted">{CATEGORY_LABELS[product.category]}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-shifaa-ink">{formatDZD(product.price)}</p>
                {product.compareAtPrice && (
                  <p className="text-xs text-shifaa-muted line-through">{formatDZD(product.compareAtPrice)}</p>
                )}
              </div>
            </div>
            {product.shortDescription && (
              <p className="mt-1.5 text-xs text-shifaa-muted line-clamp-2">{product.shortDescription}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-1 text-xs text-shifaa-muted">
              <Star className="h-3.5 w-3.5 fill-shifaa-lime text-shifaa-lime" aria-hidden />
              <span>{product.rating}</span>
              <span>({product.reviewCount})</span>
              <StockBadge inStock={product.inStock} />
            </div>
            <ProductQuickActions product={product} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-surface group flex flex-col overflow-hidden transition hover:shadow-lift">
      <Link href={`/produit/${product.slug}`} className="relative block aspect-square overflow-hidden bg-shifaa-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-shifaa-green px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
              Nouveau
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
              Best-seller
            </span>
          )}
        </div>
        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-shifaa-lime px-2.5 py-0.5 text-xs font-semibold text-shifaa-ink shadow-sm">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700">
              Rupture de stock
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-shifaa-muted">{product.brand}</p>
        <Link href={`/produit/${product.slug}`}>
          <h3 className="mt-1 font-medium text-shifaa-ink line-clamp-2 hover:text-shifaa-green text-sm">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-shifaa-muted">{CATEGORY_LABELS[product.category]}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-shifaa-muted">
          <Star className="h-3.5 w-3.5 fill-shifaa-lime text-shifaa-lime" aria-hidden />
          <span className="font-medium text-shifaa-ink">{product.rating}</span>
          <span>({product.reviewCount} avis)</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-semibold text-shifaa-ink">{formatDZD(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-shifaa-muted line-through">
              {formatDZD(product.compareAtPrice)}
            </span>
          )}
        </div>
        <StockBadge inStock={product.inStock} />
        <ProductQuickActions product={product} />
      </div>
    </article>
  );
}
