import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export const metadata = {
  title: "Promotions",
  description: "Réductions temporaires, lots et offres découverte sur produits parapharmaceutiques.",
};

export default function PromotionsPage() {
  const onSale = PRODUCTS.filter((p) => p.compareAtPrice).slice(0, 24);

  return (
    <>
      <PageHeader
        title="Promotions"
        description="Réductions temporaires, coffrets et offres saisonnières. Prix en DZD TTC."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {["Été", "Rentrée", "Fêtes"].map((season) => (
            <div key={season} className="card-surface bg-gradient-to-br from-shifaa-lime/30 to-shifaa-cream p-6">
              <h2 className="font-display text-xl font-semibold">Opération {season}</h2>
              <p className="mt-2 text-sm text-shifaa-muted">Sélections thématiques à prix réduits</p>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold">
          Offres en cours ({PRODUCTS.filter((p) => p.compareAtPrice).length} références)
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {onSale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
