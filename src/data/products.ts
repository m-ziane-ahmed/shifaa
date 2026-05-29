import type { Product } from "@/lib/types";
import { generateCatalog } from "@/data/generate-products";

export const PRODUCTS: Product[] = generateCatalog(1500);

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    limit
  );
}

export function getFeaturedProducts() {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 8);
  const onSale = PRODUCTS.filter((p) => p.compareAtPrice).slice(0, 8);

  return {
    bestSellers: bestSellers.length ? bestSellers : PRODUCTS.slice(0, 4),
    newArrivals: newArrivals.length ? newArrivals : PRODUCTS.slice(4, 8),
    onSale: onSale.length ? onSale : PRODUCTS.filter((p) => p.compareAtPrice).slice(0, 4),
  };
}

export function getAllBrands(): string[] {
  return [...new Set(PRODUCTS.map((p) => p.brand))].sort();
}
