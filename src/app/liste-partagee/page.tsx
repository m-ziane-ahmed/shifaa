"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

function SharedListInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("ids") ?? "";
  const ids = raw.split(",").filter(Boolean);
  const products = ids
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <>
      {products.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <p className="text-shifaa-muted">Liste vide ou lien expiré.</p>
          <Link href="/boutique" className="btn-primary mt-6 inline-flex">
            Boutique
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p!.id} product={p!} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ListePartageePage() {
  return (
    <>
      <PageHeader title="Liste partagée" description="Produits sélectionnés par un client Shifaa" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Suspense fallback={<p className="text-shifaa-muted">Chargement…</p>}>
          <SharedListInner />
        </Suspense>
      </div>
    </>
  );
}
