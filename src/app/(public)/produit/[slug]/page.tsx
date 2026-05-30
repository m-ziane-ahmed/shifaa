import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, Shield, Clock, Package, BarChart3, Share2 } from "lucide-react";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { AddToCartButton, ProductStickyBar } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { WhatsAppProductButton } from "@/components/WhatsAppProductButton";
import { ProductViewTracker } from "@/components/RecentlyViewed";
import { StockAlertForm } from "@/components/StockAlertForm";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductBadges, AuthenticityBadge } from "@/components/ProductBadges";
import { ProductTabs } from "@/components/ProductTabs";
import { getProductBySlug, getRelatedProducts, getComplementaryProducts } from "@/lib/products-db";
import { WILAYAS } from "@/data/wilayas";
import { CATEGORY_LABELS } from "@/data/categories";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: `${product.name} — ${product.brand} | Shifaa`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, complementary] = await Promise.all([
    getRelatedProducts(product, 4),
    getComplementaryProducts(product, 4),
  ]);

  const gallery = product.images?.length ? product.images : [product.image];
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <>
      <ProductViewTracker productId={product.id} />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[
          { label: "Boutique", href: "/boutique" },
          { label: CATEGORY_LABELS[product.category], href: `/boutique?categorie=${product.category}` },
          { label: product.name },
        ]} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">

        {/* ── Zone principale ─────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-2">

          {/* Galerie */}
          <ProductGallery images={gallery} name={product.name} />

          {/* Infos produit */}
          <div className="space-y-4">
            {/* Marque + catégorie */}
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/boutique?marque=${encodeURIComponent(product.brand)}`}
                  className="text-sm font-semibold text-shifaa-green hover:underline">
                  {product.brand}
                </Link>
                <span className="mx-2 text-shifaa-muted">·</span>
                <Link href={`/boutique?categorie=${product.category}`}
                  className="text-sm text-shifaa-muted hover:text-shifaa-green">
                  {CATEGORY_LABELS[product.category]}
                </Link>
              </div>
              {product.sku && (
                <span className="text-xs text-shifaa-muted font-mono">Réf. {product.sku}</span>
              )}
            </div>

            {/* Nom */}
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink leading-tight">
              {product.name}
            </h1>

            {/* Badges statut */}
            <div className="flex flex-wrap items-center gap-2">
              {product.isNew && (
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                  ✨ Nouveau
                </span>
              )}
              {product.isBestSeller && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                  ⭐ Best-seller
                </span>
              )}
              {product.format && (
                <span className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-muted">
                  {product.format}
                </span>
              )}
              {product.skinType?.[0] && (
                <span className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-muted">
                  Peau {product.skinType[0]}
                </span>
              )}
              {product.ageGroup && (
                <span className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-muted">
                  {product.ageGroup}
                </span>
              )}
            </div>

            {/* Note */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="font-semibold text-shifaa-ink">{product.rating}</span>
              <span className="text-sm text-shifaa-muted">({product.reviewCount} avis)</span>
            </div>

            {/* Prix */}
            <div className="rounded-2xl border border-shifaa-border bg-white p-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-shifaa-ink">{formatDZD(product.price)}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-xl text-shifaa-muted line-through">
                      {formatDZD(product.compareAtPrice)}
                    </span>
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
              {product.compareAtPrice && (
                <p className="mt-1 text-sm font-medium text-green-700">
                  Vous économisez {formatDZD(product.compareAtPrice - product.price)}
                </p>
              )}
              <p className="mt-1 text-xs text-shifaa-muted">Prix TTC en DZD · Frais de livraison calculés au panier</p>
            </div>

            {/* Description courte */}
            <p className="text-shifaa-muted">{product.shortDescription}</p>

            {/* Badges certifications */}
            <ProductBadges product={product} />

            {/* Disponibilité + livraison */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {product.inStock ? (
                <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1.5">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">En stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5">
                  <Package className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-700">Rupture de stock</span>
                </div>
              )}
              {product.inStock && (
                <div className="flex items-center gap-2 text-shifaa-muted">
                  <Clock className="h-4 w-4" />
                  <span>Expédition sous 24–48h</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <AddToCartButton product={product} />

            {/* Actions secondaires */}
            <div className="flex flex-wrap gap-2">
              <WhatsAppProductButton name={product.name} price={product.price} slug={product.slug} />
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const url = window.location.href;
                    if (navigator.share) navigator.share({ title: product.name, url });
                    else navigator.clipboard.writeText(url);
                  }
                }}
                className="btn-secondary flex items-center gap-2 py-2 text-sm"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </button>
            </div>

            {/* Alerte retour stock */}
            {!product.inStock && (
              <StockAlertForm productId={product.id} productName={product.name} />
            )}

            {/* Authenticité */}
            <AuthenticityBadge certified={product.supplierCertified ?? true} />

            {/* Réassurance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-shifaa-border bg-white p-3">
                <Truck className="h-5 w-5 text-shifaa-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-shifaa-ink">Livraison nationale</p>
                  <p className="text-shifaa-muted mt-0.5">Domicile ou point relais</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-shifaa-border bg-white p-3">
                <Shield className="h-5 w-5 text-shifaa-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-shifaa-ink">Retours simplifiés</p>
                  <Link href="/service-client/retours" className="text-shifaa-green hover:underline mt-0.5 block">
                    Voir la politique →
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-shifaa-border bg-white p-3">
                <BarChart3 className="h-5 w-5 text-shifaa-green shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-shifaa-ink">Paiement sécurisé</p>
                  <p className="text-shifaa-muted mt-0.5">CIB · Edahabia · Paiement à la livraison</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-shifaa-border bg-white p-3">
                <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-shifaa-ink">Produit certifié</p>
                  <p className="text-shifaa-muted mt-0.5">{product.regulatoryCategory ?? "Parapharmacie"}</p>
                </div>
              </div>
            </div>

            {/* Livraison par wilaya */}
            <details className="rounded-xl border border-shifaa-border bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-shifaa-ink">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-shifaa-green" />
                  Délais de livraison
                </span>
                <span className="text-xs text-shifaa-muted">▼</span>
              </summary>
              <div className="border-t border-shifaa-border px-4 pb-4 pt-3">
                <ul className="space-y-2 text-sm">
                  {WILAYAS.slice(0, 6).map((w) => (
                    <li key={w.code} className="flex justify-between">
                      <span className="text-shifaa-muted">{w.name}</span>
                      <span className="font-medium">{w.deliveryDays}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/service-client/livraison" className="mt-3 block text-xs font-medium text-shifaa-green hover:underline">
                  Voir toutes les wilayas →
                </Link>
              </div>
            </details>
          </div>
        </div>

        {/* ── Onglets enrichis ────────────────────────────────── */}
        <ProductTabs product={product} />

        {/* ── Routine & produits complémentaires ──────────────── */}
        {complementary.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-shifaa-ink">Complétez votre routine</h2>
                <p className="text-sm text-shifaa-muted mt-1">Produits complémentaires pour un soin optimal</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {complementary.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Produits similaires ──────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-shifaa-ink mb-6">Produits similaires</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Compliance */}
        <div className="mt-12">
          <ComplianceBanner compact />
        </div>
      </div>

      {/* Sticky bar mobile */}
      <ProductStickyBar product={product} />
    </>
  );
}
