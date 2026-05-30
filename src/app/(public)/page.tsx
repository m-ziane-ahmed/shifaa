import Link from "next/link";
import { ArrowRight, BookOpen, HelpCircle, Mail } from "lucide-react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { PromoCarousel } from "@/components/PromoCarousel";
import { ProductCard } from "@/components/ProductCard";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { ReassuranceBar } from "@/components/ReassuranceBar";
import { getFeaturedProducts } from "@/lib/products-db";
import { RecentlyViewed } from "@/components/RecentlyViewed";

export default async function HomePage() {
  const { bestSellers, newArrivals, onSale } = await getFeaturedProducts();

  return (
    <>
      <ComplianceBanner />
      <PromoCarousel />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-shifaa-lime/30 via-shifaa-cream to-shifaa-cream" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium ing-widest text-shifaa-green">
              Parapharmacie · Algérie
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-shifaa-ink md:text-5xl lg:text-6xl">
              Votre bien-être au quotidien, en toute transparence
            </h1>
            <p className="mt-6 text-lg text-shifaa-muted leading-relaxed">
              Shifaa est une boutique spécialisée en produits parapharmaceutiques — hygiène, soins,
              compléments autorisés et accessoires. Plus de 1 500 références, livraison dans toute
              l&apos;Algérie, prix affichés en DZD.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/boutique" className="btn-primary">
                Découvrir la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/a-propos" className="btn-secondary">
                Qui sommes-nous ?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ReassuranceBar />

      <ExpertiseSection variant="home" />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-shifaa-ink">
              Catégories phares
            </h2>
            <p className="mt-2 text-shifaa-muted">Explorez notre catalogue par univers</p>
          </div>
          <Link href="/boutique" className="hidden text-sm font-medium text-shifaa-green hover:underline sm:block">
            Voir tout →
          </Link>
        </div>
        <div className="mt-10">
          <CategoryGrid />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-shifaa-ink">Meilleures ventes</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-shifaa-ink">Nouveautés</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/nouveautes" className="btn-secondary">
            Toutes les nouveautés
          </Link>
        </div>
      </section>

      {onSale.length > 0 && (
        <section className="bg-shifaa-lime/15 py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-shifaa-ink">Promotions du moment</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {onSale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/promotions" className="btn-primary">
                Voir les promotions
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="card-surface grid gap-8 p-8 md:grid-cols-3">
          <Link href="/conseils" className="group flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-shifaa-lime/40">
              <BookOpen className="h-6 w-6 text-shifaa-green" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-shifaa-green">Conseils & guides</h3>
              <p className="mt-1 text-sm text-shifaa-muted">Articles et guides d&apos;achat prudents</p>
            </div>
          </Link>
          <Link href="/service-client" className="group flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-shifaa-lime/40">
              <HelpCircle className="h-6 w-6 text-shifaa-green" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-shifaa-green">FAQ & aide</h3>
              <p className="mt-1 text-sm text-shifaa-muted">Commandes, livraison, paiements, retours</p>
            </div>
          </Link>
          <Link href="/contact" className="group flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-shifaa-lime/40">
              <Mail className="h-6 w-6 text-shifaa-green" />
            </div>
            <div>
              <h3 className="font-medium group-hover:text-shifaa-green">Nous contacter</h3>
              <p className="mt-1 text-sm text-shifaa-muted">Une question ? Notre équipe vous répond</p>
            </div>
          </Link>
        </div>
      </section>

      <RecentlyViewed />

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <ComplianceBanner compact />
      </section>
    </>
  );
}
