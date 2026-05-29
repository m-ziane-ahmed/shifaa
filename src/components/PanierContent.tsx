"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCartTotals } from "@/hooks/useCartTotals";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import { WhatsAppOrderButton } from "@/components/WhatsAppOrderButton";
import { formatDZD } from "@/lib/utils";

export function PanierContent() {
  const { items, subtotal, updateQuantity, removeItem, applyPromo, promo, removePromo } = useCart();
  const { discount, delivery, total } = useCartTotals();
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");

  function handlePromo(e: FormEvent) {
    e.preventDefault();
    const result = applyPromo(promoInput);
    setPromoMsg(result.message);
    if (result.ok) setPromoInput("");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="card-surface p-12 text-center">
          <p className="text-shifaa-muted">Votre panier est vide.</p>
          <Link href="/boutique" className="btn-primary mt-6 inline-flex">
            Parcourir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 pb-28 md:pb-10">
      <FreeShippingBar />

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card-surface flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-shifaa-cream">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/produit/${item.slug}`} className="font-medium hover:text-shifaa-green">
                  {item.name}
                </Link>
                <p className="text-sm text-shifaa-muted">{item.brand}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <label className="text-sm">
                    Qté{" "}
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      className="ml-1 w-14 rounded-lg border border-shifaa-border px-2 py-1"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatDZD(item.price * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card-surface h-fit p-6">
          <h2 className="font-semibold">Récapitulatif</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-shifaa-muted">Sous-total</dt>
              <dd>{formatDZD(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-shifaa-green">
                <dt>Réduction {promo?.label && `(${promo.code})`}</dt>
                <dd>−{formatDZD(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-shifaa-muted">Livraison (estimée)</dt>
              <dd>{delivery === 0 ? "Offerte" : formatDZD(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-shifaa-border pt-2 text-base font-semibold">
              <dt>Total TTC</dt>
              <dd>{formatDZD(total)}</dd>
            </div>
          </dl>

          <form onSubmit={handlePromo} className="mt-4">
            <label htmlFor="promo" className="text-sm font-medium">
              Code promotionnel
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="BIENVENUE10 ou LIVRAISON0"
                className="flex-1 rounded-xl border border-shifaa-border px-3 py-2 text-sm uppercase"
              />
              <button type="submit" className="btn-secondary py-2 text-sm">
                Appliquer
              </button>
            </div>
            {promoMsg && <p className="mt-1 text-xs text-shifaa-green">{promoMsg}</p>}
            {promo && (
              <button type="button" onClick={() => { removePromo(); setPromoMsg(""); }} className="mt-1 text-xs text-shifaa-muted hover:underline">
                Retirer le code
              </button>
            )}
          </form>

          <Link href="/commande" className="btn-primary mt-6 hidden w-full md:flex">
            Passer la commande
          </Link>
          <WhatsAppOrderButton className="mt-3 hidden w-full md:flex" />
          <Link href="/boutique" className="mt-4 block text-center text-sm text-shifaa-green hover:underline">
            Continuer mes achats
          </Link>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white p-4 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-shifaa-muted">Total estimé</p>
            <p className="text-lg font-semibold">{formatDZD(total)}</p>
          </div>
          <Link href="/commande" className="btn-primary shrink-0">
            Commander
          </Link>
        </div>
      </div>
    </div>
  );
}
