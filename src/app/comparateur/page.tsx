"use client";

import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useCompare } from "@/context/CompareContext";
import { CATEGORY_LABELS } from "@/data/categories";
import { formatDZD } from "@/lib/utils";

export default function ComparateurPage() {
  const { products, remove, clear } = useCompare();

  return (
    <>
      <PageHeader
        title="Comparateur"
        description="Comparez jusqu'à 4 produits côte à côte"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {products.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <p className="text-shifaa-muted">Aucun produit à comparer.</p>
            <Link href="/boutique" className="btn-primary mt-6 inline-flex">
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={clear} className="text-sm text-shifaa-green hover:underline">
                Tout effacer
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-medium text-shifaa-muted">Critère</th>
                    {products.map((p) => (
                      <th key={p.id} className="card-surface p-3 align-top">
                        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl bg-shifaa-cream">
                          <Image src={p.image} alt="" fill className="object-cover" sizes="96px" />
                        </div>
                        <Link href={`/produit/${p.slug}`} className="mt-2 block font-semibold hover:text-shifaa-green">
                          {p.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          className="mt-2 text-xs text-red-600 hover:underline"
                        >
                          Retirer
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Prix</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{formatDZD(p.price)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Marque</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{p.brand}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Catégorie</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{CATEGORY_LABELS[p.category]}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Note</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{p.rating}/5 ({p.reviewCount})</td>
                    ))}
                  </tr>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Format</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{p.format ?? "—"}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-shifaa-border">
                    <td className="p-3 font-medium">Stock</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3">{p.inStock ? "En stock" : "Rupture"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
