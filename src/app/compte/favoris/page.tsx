"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { WishlistShareButton } from "@/components/WishlistShareButton";

export default function FavorisPage() {
  const { ids } = useWishlist();
  const products = ids
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <>
      <PageHeader title="Mes favoris" description={`${products.length} produit(s) enregistré(s)`} />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {products.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <p className="text-shifaa-muted">Aucun favori pour le moment.</p>
            <Link href="/boutique" className="btn-primary mt-6 inline-flex">
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <>
          <div className="mb-6">
            <WishlistShareButton />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
          </>
        )}
        <Link href="/compte" className="mt-8 inline-block text-sm text-shifaa-green hover:underline">
          ← Mon compte
        </Link>
      </div>
    </>
  );
}
