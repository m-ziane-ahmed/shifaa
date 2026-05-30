import Link from "next/link";
import { ArrowRight, BookOpen, HelpCircle, Mail, Shield, Star, Users, Package, Truck, Lock } from "lucide-react";
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

      {/* Preuve sociale */}
      <section className="bg-shifaa-dark text-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Stats */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-shifaa-lime">Shifaa en chiffres</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Package, value: "1 500+", label: "références" },
                  { icon: Users, value: "5 000+", label: "clients" },
                  { icon: Truck, value: "98%", label: "livraisons réussies" },
                  { icon: Star, value: "4.8/5", label: "satisfaction" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                    <Icon className="h-4 w-4 text-shifaa-lime mx-auto mb-1" />
                    <p className="text-lg font-bold">{value}</p>
                    <p className="text-xs text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Garanties */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-shifaa-lime">Nos garanties</h2>
              {[
                { icon: Shield, label: "Produits authentiques garantis", sub: "Fournisseurs agréés uniquement" },
                { icon: Lock, label: "Paiement 100% sécurisé", sub: "CIB, Edahabia, paiement à la livraison" },
                { icon: Truck, label: "Livraison suivie", sub: "Notification SMS/email à chaque étape" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-shifaa-lime/20">
                    <Icon className="h-4 w-4 text-shifaa-lime" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-white/50">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Direction scientifique */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-shifaa-lime">Expertise validée</h2>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👩‍⚕️</span>
                  <div>
                    <p className="font-medium text-sm">Docteur S.Benali</p>
                    <p className="text-xs text-white/60">Docteur en Pharmacie</p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Direction scientifique qui valide nos contenus et notre sélection produits pour un accompagnement de confiance.
                </p>
              </div>
              <Link href="/a-propos" className="inline-flex items-center gap-2 text-sm text-shifaa-lime hover:underline">
                En savoir plus sur Shifaa →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <ComplianceBanner compact />
      </section>
    </>
  );
}
