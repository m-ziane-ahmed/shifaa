import { createAdminClient } from "@/lib/supabase-server";
import type { Product, ProductCategory } from "@/lib/types";

// Mapper les colonnes Supabase vers le type Product du front
function mapProduct(row: Record<string, unknown>): Product {
  const imgs = (row.images as string[]) ?? [];
  const validImgs = imgs.filter((i) => i && i.length > 0);
  const fallback = `/images/products/${row.category}/01.jpg`;
  const mainImage = validImgs[0] ?? fallback;
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as ProductCategory,
    price: row.price as number,
    compareAtPrice: (row.compare_at_price as number) ?? undefined,
    image: mainImage,
    images: validImgs.length ? validImgs : [fallback],
    rating: Number(row.rating),
    reviewCount: row.review_count as number,
    inStock: (row.stock as number) > 0,
    isNew: row.is_new as boolean,
    isBestSeller: row.is_best_seller as boolean,
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    benefits: (row.benefits as string[]) ?? [],
    usage: (row.usage as string) ?? "",
    precautions: (row.precautions as string) ?? "",
    ingredients: (row.ingredients as string) ?? "",
    complianceNote: (row.compliance_note as string) ?? "",
    need: (row.need as string) ?? undefined,
    skinType: (row.skin_type as string[]) ?? undefined,
    ageGroup: (row.age_group as string) ?? undefined,
    format: (row.format as string) ?? undefined,
  };
}

export interface CatalogFilters {
  q?: string;
  categorie?: string;
  marque?: string;
  prixMax?: number;
  stock?: boolean;
  tri?: string;
  peau?: string;
  format?: string;
  age?: string;
  besoin?: string;
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: CatalogFilters = {}) {
  const supabase = createAdminClient();
  const {
    q, categorie, marque, prixMax, stock,
    tri, peau, format, age, besoin,
    page = 1, pageSize = 12,
  } = filters;

  let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,brand.ilike.%${q}%,short_description.ilike.%${q}%`
    );
  }
  if (categorie) query = query.eq("category", categorie);
  if (marque) query = query.eq("brand", marque);
  if (prixMax) query = query.lte("price", prixMax);
  if (stock) query = query.gt("stock", 0);
  if (peau) query = query.contains("skin_type", [peau]);
  if (format) query = query.eq("format", format);
  if (age) query = query.eq("age_group", age);
  if (besoin) query = query.eq("need", besoin);

  switch (tri) {
    case "prix-asc":  query = query.order("price", { ascending: true }); break;
    case "prix-desc": query = query.order("price", { ascending: false }); break;
    case "avis":      query = query.order("rating", { ascending: false }); break;
    case "nouveaute": query = query.order("is_new", { ascending: false }); break;
    default:          query = query.order("is_best_seller", { ascending: false }); break;
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  return {
    products: (data ?? []).map(mapProduct),
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
    currentPage: page,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return mapProduct(data);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(limit);

  return (data ?? []).map(mapProduct);
}

export async function getFeaturedProducts() {
  const supabase = createAdminClient();

  const [bestSellers, newArrivals, onSale] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).eq("is_best_seller", true).limit(8),
    supabase.from("products").select("*").eq("is_active", true).eq("is_new", true).limit(8),
    supabase.from("products").select("*").eq("is_active", true).not("compare_at_price", "is", null).limit(8),
  ]);

  return {
    bestSellers: (bestSellers.data ?? []).map(mapProduct),
    newArrivals: (newArrivals.data ?? []).map(mapProduct),
    onSale: (onSale.data ?? []).map(mapProduct),
  };
}

export async function getAllBrands(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("brand").eq("is_active", true);
  const brands = [...new Set((data ?? []).map((r) => r.brand as string))].sort();
  return brands;
}
