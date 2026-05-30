"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShieldCheck, RefreshCw, Lock, Headphones, Truck, Tag, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartTotals } from "@/hooks/useCartTotals";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import { WhatsAppOrderButton } from "@/components/WhatsAppOrderButton";
import { formatDZD } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart-pricing";

const REASSURANCE = [
  { icon: ShieldCheck, label: "Produits authentiques", sub: "Fournisseurs agréés" },
  { icon: Truck, label: "Livraison suivie", sub: "58 wilayas couvertes" },
  { icon: RefreshCw, label: "Retours simplifiés", sub: "Sous conditions légales" },
  { icon: Lock, label: "Paiement sécurisé", sub: "CIB · Edahabia · Livraison" },
  { icon: Headphones, label: "Service client", sub: "Sam.–Jeu. 9h–18h" },
];

export function PanierContent() {
  const { items, subtotal, updateQuantity, removeItem, applyPromo, promo, removePromo } = useCart();
  const { discount, delivery, total } = useCartTotals();
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoError, setPromoError] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  function handlePromo(e: FormEvent) {
    e.preventDefault();
    const result = applyPromo(promoInput.trim().toUpperCase());
    setPromoMsg(result.message);
    setPromoError(!result.ok);
    if (result.ok) setPromoInput("");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 text-center">
        <div className="card-surface p-12">
          <p className="text-4xl mb-4">🛒</p>
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-2">Votre panier est vide</h2>
          <p className="text-shifaa-muted mb-6">Explorez notre catalogue pour trouver vos produits</p>
          <Link href="/boutique" className="btn-primary">
            Parcourir la boutique
          </Link>
        </div>
        {/* Suggestions rapides */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Hygiène", "Soins visage", "Compléments", "Bio & naturel", "Bébé"].map((cat) => (
            <Link key={cat} href={`/boutique?q=${encodeURIComponent(cat)}`}
              className="rounded-full border border-shifaa-border px-4 py-2 text-sm text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 pb-28 md:pb-12">

      {/* Barre livraison gratuite */}
      <FreeShippingBar />

      {/* Header panier */}
      <div className="mt-6 flex items-center justify-between mb-4">
        <h2 className="font-semibold text-shifaa-ink">
          {totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier
        </h2>
        <Link href="/boutique" className="text-sm text-shifaa-green hover:underline">
          + Continuer mes achats
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Liste articles ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            return (
              <div key={item.productId} className="card-surface flex gap-4 p-4 group">
                {/* Image */}
                <Link href={`/produit/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-shifaa-cream">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </Link>

                {/* Infos */}
                <div className="flex flex-1 flex-col min-w-0">
                  <Link href={`/produit/${item.slug}`}
                    className="font-medium text-shifaa-ink hover:text-shifaa-green line-clamp-2 leading-tight">
                    {item.name}
                  </Link>
                  <p className="text-xs text-shifaa-muted mt-0.5">{item.brand}</p>
                  <p className="text-xs text-shifaa-muted">{formatDZD(item.price)} / unité</p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Quantité */}
                    <div className="flex items-center rounded-xl border border-shifaa-border bg-white overflow-hidden">
                      <button type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-2 text-lg text-shifaa-muted hover:bg-shifaa-cream hover:text-shifaa-ink transition-colors"
                        aria-label="Diminuer">
                        −
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-semibold text-shifaa-ink">
                        {item.quantity}
                      </span>
                      <button type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-2 text-lg text-shifaa-muted hover:bg-shifaa-cream hover:text-shifaa-ink transition-colors"
                        aria-label="Augmenter">
                        +
                      </button>
                    </div>

                    {/* Actions + prix */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-shifaa-ink">{formatDZD(lineTotal)}</span>
                      <button type="button" onClick={() => removeItem(item.productId)}
                        className="text-shifaa-muted hover:text-red-500 transition-colors p-1"
                        aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Réassurance inline */}
          <div className="card-surface p-4 mt-2">
            <div className="flex flex-wrap gap-4">
              {REASSURANCE.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-shifaa-muted">
                  <Icon className="h-3.5 w-3.5 text-shifaa-green shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Récapitulatif ──────────────────────────────── */}
        <aside className="space-y-4">
          <div className="card-surface p-6">
            <h2 className="font-semibold text-shifaa-ink mb-4">Récapitulatif</h2>

            {/* Barre progression livraison gratuite */}
            {amountToFreeShipping > 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-medium text-amber-800 mb-1.5">
                  Plus que <span className="font-bold">{formatDZD(amountToFreeShipping)}</span> pour la livraison gratuite !
                </p>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                </div>
              </div>
            )}
            {amountToFreeShipping === 0 && (
              <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3">
                <p className="text-xs font-medium text-green-700">🎉 Livraison gratuite débloquée !</p>
              </div>
            )}

            {/* Détail prix */}
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-shifaa-muted">{totalItems} article{totalItems > 1 ? "s" : ""}</dt>
                <dd className="font-medium">{formatDZD(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Réduction {promo?.code && <span className="font-mono text-xs">({promo.code})</span>}
                  </dt>
                  <dd className="font-medium">−{formatDZD(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-shifaa-muted">Livraison (estimée)</dt>
                <dd className={delivery === 0 ? "font-medium text-green-600" : "font-medium"}>
                  {delivery === 0 ? "Offerte" : formatDZD(delivery)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-shifaa-border pt-3 text-base font-bold">
                <dt>Total TTC</dt>
                <dd className="text-shifaa-ink">{formatDZD(total)}</dd>
              </div>
            </dl>

            {/* Code promo */}
            <form onSubmit={handlePromo} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoMsg(""); }}
                  placeholder="Code promo"
                  className="flex-1 rounded-xl border border-shifaa-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
                />
                <button type="submit" className="btn-secondary py-2 text-sm shrink-0">
                  Appliquer
                </button>
              </div>
              {promoMsg && (
                <p className={`mt-1.5 text-xs font-medium ${promoError ? "text-red-600" : "text-green-600"}`}>
                  {promoMsg}
                </p>
              )}
              {promo && (
                <button type="button" onClick={() => { removePromo(); setPromoMsg(""); }}
                  className="mt-1 text-xs text-shifaa-muted hover:text-red-500 transition-colors">
                  ✕ Retirer le code {promo.code}
                </button>
              )}
            </form>

            {/* CTAs */}
            <Link href="/commande"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-3.5 text-sm font-semibold text-white hover:bg-[#0f3d3a] transition-colors shadow-lg">
              <Lock className="h-4 w-4" />
              Passer la commande
              <ChevronRight className="h-4 w-4" />
            </Link>
            <WhatsAppOrderButton className="mt-2 w-full" />

            {/* Badges sécurité */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-shifaa-muted">
              <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-shifaa-green" />SSL</span>
              <span>·</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-shifaa-green" />Sécurisé</span>
              <span>·</span>
              <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 text-shifaa-green" />Retours</span>
            </div>
          </div>

          {/* Modes paiement */}
          <div className="card-surface p-4">
            <p className="text-xs font-medium text-shifaa-muted mb-3">Modes de paiement acceptés</p>
            <div className="flex flex-wrap gap-2">
              {["💳 CIB", "📱 Edahabia", "💵 À la livraison"].map((m) => (
                <span key={m} className="rounded-lg border border-shifaa-border px-3 py-1.5 text-xs font-medium text-shifaa-ink bg-white">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Sticky bottom mobile ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white px-4 py-3 shadow-lg md:hidden">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-shifaa-green rounded-full transition-all"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
          </div>
          <span className="text-xs text-shifaa-muted shrink-0">
            {amountToFreeShipping > 0 ? `−${formatDZD(amountToFreeShipping)} livraison` : "🎉 Livraison offerte"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-shifaa-muted">Total estimé</p>
            <p className="text-lg font-bold text-shifaa-ink">{formatDZD(total)}</p>
          </div>
          <Link href="/commande"
            className="flex items-center gap-2 rounded-xl bg-shifaa-green px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f3d3a] transition-colors">
            <Lock className="h-4 w-4" />
            Commander
          </Link>
        </div>
      </div>
    </div>
  );
}
