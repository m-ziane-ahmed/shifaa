import type { ProductCategory } from "@/lib/types";

/** Chemins publics des visuels catalogue (servis depuis /public/images/products/) */
const files = (category: ProductCategory, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `/images/products/${category}/${n}.jpg`;
  });

export const LOCAL_PRODUCT_IMAGES: Record<ProductCategory, readonly string[]> = {
  "visage-peau": files("visage-peau", 10),
  "corps-hygiene": files("corps-hygiene", 10),
  cheveux: files("cheveux", 10),
  "bebe-maternite": files("bebe-maternite", 10),
  complements: files("complements", 10),
  "bien-etre": files("bien-etre", 10),
  dispositifs: files("dispositifs", 10),
  "bio-naturel": files("bio-naturel", 10),
};

export function getLocalProductImage(category: ProductCategory, globalId: number): string {
  const pool = LOCAL_PRODUCT_IMAGES[category];
  return pool[globalId % pool.length];
}

/** Galerie : 3 visuels distincts par produit */
export function getLocalProductGallery(category: ProductCategory, globalId: number): string[] {
  const pool = LOCAL_PRODUCT_IMAGES[category];
  const base = globalId % pool.length;
  const indices = [base, (base + 3) % pool.length, (base + 7) % pool.length];
  return [...new Set(indices.map((i) => pool[i]))];
}
