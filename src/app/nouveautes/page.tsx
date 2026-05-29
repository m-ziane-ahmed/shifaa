import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export const metadata = { title: "Nouveautés" };

export default function NouveautesPage() {
  const items = PRODUCTS.filter((p) => p.isNew).slice(0, 24);

  return (
    <>
      <PageHeader
        title="Nouveautés"
        description="Les derniers produits ajoutés à notre catalogue parapharmaceutique."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="mb-6 text-sm text-shifaa-muted">
          {PRODUCTS.filter((p) => p.isNew).length} nouveautés dans le catalogue
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
