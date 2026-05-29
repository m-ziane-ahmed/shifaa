"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartTotals } from "@/hooks/useCartTotals";
import { formatDZD } from "@/lib/utils";

export function MiniCartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const { subtotal, discount, delivery, total } = useCartTotals();

  if (!drawerOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/40"
        aria-label="Fermer le panier"
        onClick={closeDrawer}
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-lift"
        aria-label="Mini panier"
      >
        <div className="flex items-center justify-between border-b border-shifaa-border px-4 py-4">
          <h2 className="font-semibold">Votre panier ({items.length})</h2>
          <button type="button" onClick={closeDrawer} className="rounded-full p-2 hover:bg-shifaa-cream" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-shifaa-muted">Panier vide</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produit/${item.slug}`} onClick={closeDrawer} className="text-sm font-medium line-clamp-2 hover:text-shifaa-green">
                      {item.name}
                    </Link>
                    <p className="text-xs text-shifaa-muted">{formatDZD(item.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                        className="w-12 rounded border border-shifaa-border px-1 py-0.5 text-xs"
                      />
                      <button type="button" onClick={() => removeItem(item.productId)} className="text-xs text-red-600 hover:underline">
                        Retirer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-shifaa-border p-4">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-shifaa-muted">Sous-total</dt>
                <dd>{formatDZD(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-shifaa-green">
                  <dt>Réduction</dt>
                  <dd>−{formatDZD(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-shifaa-muted">Livraison</dt>
                <dd>{delivery === 0 ? "Offerte" : formatDZD(delivery)}</dd>
              </div>
              <div className="flex justify-between border-t border-shifaa-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatDZD(total)}</dd>
              </div>
            </dl>
            <Link href="/panier" onClick={closeDrawer} className="btn-secondary mt-4 block w-full text-center">
              Voir le panier
            </Link>
            <Link href="/commande" onClick={closeDrawer} className="btn-primary mt-2 block w-full text-center">
              Commander
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
