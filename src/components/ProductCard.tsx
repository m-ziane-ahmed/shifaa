import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import { ProductQuickActions } from "@/components/ProductQuickActions";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice &&
    Math.round((1 - product.price / product.compareAtPrice) * 100);

  return (
    <article className="card-surface group flex flex-col overflow-hidden transition hover:shadow-lift">
      <Link href={`/produit/${product.slug}`} className="relative block aspect-square overflow-hidden bg-shifaa-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-shifaa-green px-2.5 py-0.5 text-xs font-medium text-white">
            Nouveau
          </span>
        )}
        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-shifaa-lime px-2.5 py-0.5 text-xs font-semibold text-shifaa-ink">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-shifaa-muted">{product.brand}</p>
        <Link href={`/produit/${product.slug}`}>
          <h3 className="mt-1 font-medium text-shifaa-ink line-clamp-2 hover:text-shifaa-green">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-shifaa-muted">{CATEGORY_LABELS[product.category]}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-shifaa-muted">
          <Star className="h-3.5 w-3.5 fill-shifaa-lime text-shifaa-lime" aria-hidden />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-semibold text-shifaa-ink">{formatDZD(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-shifaa-muted line-through">
              {formatDZD(product.compareAtPrice)}
            </span>
          )}
        </div>
        {!product.inStock && (
          <p className="mt-2 text-xs font-medium text-amber-700">Rupture de stock</p>
        )}
        <ProductQuickActions product={product} />
      </div>
    </article>
  );
}
