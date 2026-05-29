"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart-pricing";
import { formatDZD } from "@/lib/utils";
import { useCartTotals } from "@/hooks/useCartTotals";

export function FreeShippingBar() {
  const { subtotal, amountToFreeShipping, delivery } = useCartTotals();

  if (subtotal === 0) return null;

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const reached = delivery === 0 && subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="rounded-xl border border-shifaa-lime/40 bg-shifaa-lime/15 p-4">
      {reached || amountToFreeShipping === 0 ? (
        <p className="text-sm font-medium text-shifaa-green">Livraison offerte sur cette commande</p>
      ) : (
        <p className="text-sm text-shifaa-ink">
          Plus que <strong>{formatDZD(amountToFreeShipping)}</strong> pour la livraison offerte
        </p>
      )}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
        <div
          className="h-full rounded-full bg-shifaa-green transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
