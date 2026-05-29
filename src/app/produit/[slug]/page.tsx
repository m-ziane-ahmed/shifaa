import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, Shield, AlertCircle } from "lucide-react";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { AddToCartButton, ProductStickyBar } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { WhatsAppProductButton } from "@/components/WhatsAppProductButton";
import { CompareButton } from "@/components/CompareButton";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductViewTracker } from "@/components/RecentlyViewed";
import { StockAlertForm } from "@/components/StockAlertForm";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { WILAYAS } from "@/data/wilayas";
import { CATEGORY_LABELS } from "@/data/categories";
import { formatDZD } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const gallery = product.images?.length ? product.images : [product.image];

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <nav className="mb-6 text-sm text-shifaa-muted" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-shifaa-green">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/boutique" className="hover:text-shifaa-green">Boutique</Link>
          <span className="mx-2">/</span>
          <span className="text-shifaa-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={gallery} name={product.name} />

          <div>
            <p className="text-sm text-shifaa-muted">{product.brand}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-shifaa-green">
              {CATEGORY_LABELS[product.category]} — Parapharmacie
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-shifaa-ink">{product.name}</h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-shifaa-lime text-shifaa-lime" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-shifaa-muted">({product.reviewCount} avis)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-semibold">{formatDZD(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-shifaa-muted line-through">
                  {formatDZD(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-shifaa-muted">Prix TTC en DZD · Frais de livraison calculés au panier</p>

            <p className="mt-4 text-shifaa-muted">{product.shortDescription}</p>

            <div className="mt-4 flex items-center gap-2 text-sm">
              {product.inStock ? (
                <span className="rounded-full bg-shifaa-lime/40 px-3 py-1 font-medium text-shifaa-ink">
                  En stock
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  Rupture de stock
                </span>
              )}
              {product.format && (
                <span className="text-shifaa-muted">Format : {product.format}</span>
              )}
            </div>

            <AddToCartButton product={product} />
            <div className="mt-3 flex flex-wrap gap-3">
              <WhatsAppProductButton name={product.name} price={product.price} slug={product.slug} />
              <CompareButton productId={product.id} />
            </div>
            {!product.inStock && (
              <StockAlertForm productId={product.id} productName={product.name} />
            )}

            <div className="mt-6 rounded-xl border border-shifaa-lime/40 bg-shifaa-lime/15 p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-shifaa-green" />
                <p className="text-sm text-shifaa-ink">{product.complianceNote}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-shifaa-border p-4">
                <Truck className="h-5 w-5 text-shifaa-green shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Livraison nationale</p>
                  <p className="text-shifaa-muted">Domicile ou point relais selon wilaya</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-shifaa-border p-4">
                <Shield className="h-5 w-5 text-shifaa-green shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Retours</p>
                  <Link href="/service-client/retours" className="text-shifaa-green hover:underline">
                    Voir la politique
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-3 prose-shifaa">{product.description}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Bénéfices</h2>
              <ul className="mt-3 list-disc pl-5 prose-shifaa space-y-1">
                {product.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-shifaa-muted">
                Ces informations sont fournies à titre indicatif et ne constituent pas une promesse
                médicale. Consultez un professionnel de santé si nécessaire.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Mode d&apos;utilisation</h2>
              <p className="mt-3 prose-shifaa">{product.usage}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Précautions</h2>
              <p className="mt-3 prose-shifaa">{product.precautions}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Composition / ingrédients</h2>
              <p className="mt-3 prose-shifaa">{product.ingredients}</p>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="card-surface p-6">
              <h3 className="font-semibold">Livraison par wilaya</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {WILAYAS.slice(0, 5).map((w) => (
                  <li key={w.code} className="flex justify-between border-b border-shifaa-border pb-2">
                    <span>{w.name}</span>
                    <span className="text-shifaa-muted">{w.deliveryDays}</span>
                  </li>
                ))}
              </ul>
              <Link href="/service-client/livraison" className="mt-4 inline-block text-sm font-medium text-shifaa-green hover:underline">
                Voir toute la couverture →
              </Link>
            </div>
            <div className="card-surface p-6">
              <h3 className="font-semibold">Avis clients</h3>
              <p className="mt-4 text-2xl font-semibold">
                {product.rating}/5 <span className="text-sm font-normal text-shifaa-muted">({product.reviewCount} avis catalogue)</span>
              </p>
            </div>
          </aside>
        </div>

        <ProductReviews productId={product.id} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title">Produits similaires</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-24 md:pb-10 md:px-6">
        <ComplianceBanner compact />
      </div>
      <ProductStickyBar product={product} />
    </>
  );
}
