"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCartTotals } from "@/hooks/useCartTotals";
import { WILAYAS } from "@/data/wilayas";
import { formatDZD } from "@/lib/utils";
import type { AddressRecord } from "@/lib/store-types";

const STEPS = ["Livraison", "Paiement", "Confirmation"];

export function CheckoutWizard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart, promo } = useCart();
  const { discount, delivery, total } = useCartTotals();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<AddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [deliveryMode, setDeliveryMode] = useState<"home" | "relay">("home");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"cod" | "cib" | "edahabia">("cod");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.name) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
    if (user) {
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((d) => setSavedAddresses(d.addresses ?? []));
    }
  }, [user]);

  function applyAddress(id: string) {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setWilaya(addr.wilaya);
    setCommune(addr.commune);
    setAddress(addr.address);
    setPhone(addr.phone);
  }

  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.replace("/panier");
    }
  }, [items.length, authLoading, router]);

  async function handleConfirm() {
    const canCheckout = user || checkoutAsGuest;
    if (!canCheckout) {
      setError("Connectez-vous ou choisissez la commande invité.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
      setError("Complétez vos coordonnées.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        items,
        subtotal,
        discount,
        promoCode: promo?.code,
        delivery,
        total,
        deliveryMode,
        wilaya,
        commune,
        address: `${firstName} ${lastName} — ${address}`,
        payment,
      };
      if (!user) {
        payload.guestName = `${firstName} ${lastName}`.trim();
        payload.guestEmail = email.trim();
        payload.guestPhone = phone.trim();
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la commande");

      const orderId = data.order.id as string;

      if (payment === "cib" || payment === "edahabia") {
        const payRes = await fetch("/api/payment/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, method: payment }),
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.error ?? "Erreur paiement");
        clearCart();
        window.location.href = payData.redirectUrl;
        return;
      }

      clearCart();
      router.push(`/commande/confirmation?order=${orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = Boolean(user || checkoutAsGuest);

  if (authLoading || items.length === 0) {
    return <p className="py-10 text-center text-shifaa-muted">Chargement…</p>;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 pb-32 md:pb-10">
        <nav className="mb-8 flex gap-2" aria-label="Étapes de commande">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                i === step
                  ? "bg-shifaa-green text-white"
                  : i < step
                    ? "bg-shifaa-lime/40 text-shifaa-ink"
                    : "bg-shifaa-cream text-shifaa-muted"
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </nav>

        {!user && (
          <div className="mb-6 rounded-xl border border-shifaa-border bg-shifaa-cream p-4 text-sm">
            <p className="font-medium text-shifaa-ink">Commander sans compte</p>
            <label className="mt-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={checkoutAsGuest}
                onChange={(e) => setCheckoutAsGuest(e.target.checked)}
                className="rounded border-shifaa-border"
              />
              <span>Continuer en invité (e-mail et téléphone requis à l&apos;étape paiement)</span>
            </label>
            <p className="mt-3 text-shifaa-muted">
              Déjà client ?{" "}
              <Link href="/compte?redirect=/commande" className="font-medium text-shifaa-green hover:underline">
                Connexion
              </Link>
              {" · "}
              <Link href="/compte/inscription?redirect=/commande" className="font-medium text-shifaa-green hover:underline">
                Inscription
              </Link>
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === 0 && (
              <section className="card-surface space-y-6 p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Truck className="h-5 w-5 text-shifaa-green" /> Livraison
                </h2>
                {savedAddresses.length > 0 && (
                  <div>
                    <label htmlFor="saved-addr" className="text-sm font-medium">Adresse enregistrée</label>
                    <select
                      id="saved-addr"
                      value={selectedAddressId}
                      onChange={(e) => {
                        if (e.target.value) applyAddress(e.target.value);
                        else setSelectedAddressId("");
                      }}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
                    >
                      <option value="">Nouvelle adresse</option>
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} — {a.commune}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: "home" as const, label: "À domicile", sub: "Selon couverture wilaya" },
                    { id: "relay" as const, label: "Point relais", sub: "Retrait sur place" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 ${
                        deliveryMode === opt.id ? "border-shifaa-green bg-shifaa-lime/10" : "border-shifaa-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMode === opt.id}
                        onChange={() => setDeliveryMode(opt.id)}
                        className="sr-only"
                      />
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-sm text-shifaa-muted">{opt.sub}</span>
                    </label>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wilaya" className="text-sm font-medium">Wilaya</label>
                    <select
                      id="wilaya"
                      required
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
                    >
                      <option value="">Sélectionner</option>
                      {WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="commune" className="text-sm font-medium">Commune</label>
                    <input
                      id="commune"
                      required
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="adresse" className="text-sm font-medium">Adresse complète</label>
                    <textarea
                      id="adresse"
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <section className="card-surface p-6">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <CreditCard className="h-5 w-5 text-shifaa-green" /> Paiement
                  </h2>
                  <div className="mt-4 space-y-3">
                    {[
                      { id: "cod" as const, label: "Paiement à la livraison", sub: "Espèces à réception" },
                      { id: "cib" as const, label: "Carte CIB", sub: "Paiement en ligne sécurisé" },
                      { id: "edahabia" as const, label: "Edahabia", sub: "Paiement en ligne sécurisé" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                          payment === opt.id ? "border-shifaa-green bg-shifaa-lime/10" : "border-shifaa-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === opt.id}
                          onChange={() => setPayment(opt.id)}
                          className="mt-1"
                        />
                        <div>
                          <span className="font-medium">{opt.label}</span>
                          <p className="text-sm text-shifaa-muted">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-shifaa-cream p-3 text-sm text-shifaa-muted">
                    <Lock className="h-4 w-4 shrink-0 text-shifaa-green" />
                    Vos données de paiement sont protégées.
                  </div>
                </section>
                <section className="card-surface p-6">
                  <h2 className="font-semibold">Coordonnées</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="prenom" className="text-sm font-medium">Prénom</label>
                      <input id="prenom" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="nom" className="text-sm font-medium">Nom</label>
                      <input id="nom" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="tel" className="text-sm font-medium">Téléphone</label>
                      <input id="tel" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {step === 2 && (
              <section className="card-surface space-y-4 p-6">
                <h2 className="font-semibold">Vérification</h2>
                <p className="text-sm text-shifaa-muted">
                  Livraison {deliveryMode === "home" ? "à domicile" : "en point relais"} —{" "}
                  {WILAYAS.find((w) => w.code === wilaya)?.name ?? wilaya}, {commune}
                </p>
                <p className="text-sm">{address}</p>
                <p className="text-sm">
                  Paiement :{" "}
                  {payment === "cod" ? "À la livraison" : payment === "cib" ? "CIB" : "Edahabia"}
                </p>
                <p className="text-sm">
                  {firstName} {lastName} · {phone} · {email}
                </p>
                <p className="text-xs text-shifaa-muted">
                  En validant, vous acceptez nos{" "}
                  <Link href="/legal/cgv" className="text-shifaa-green underline">CGV</Link>.
                </p>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </section>
            )}
          </div>

          <aside className="card-surface hidden h-fit p-6 lg:block">
            <h2 className="font-semibold">Récapitulatif</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-2">
                  <span className="text-shifaa-muted truncate">{i.name} × {i.quantity}</span>
                  <span>{formatDZD(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-shifaa-border pt-4 text-sm">
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
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatDZD(total)}</dd>
              </div>
            </dl>
            {step < 2 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 0 && (!wilaya || !commune || !address)) {
                    setError("Complétez l'adresse de livraison.");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
                className="btn-primary mt-6 w-full"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !canSubmit}
                onClick={handleConfirm}
                className="btn-primary mt-6 w-full disabled:opacity-50"
              >
                {submitting
                  ? "Validation…"
                  : payment === "cib" || payment === "edahabia"
                    ? "Payer en ligne"
                    : "Confirmer la commande"}
              </button>
            )}
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="mt-2 w-full text-sm text-shifaa-green hover:underline">
                Retour
              </button>
            )}
            {error && step < 2 && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white p-4 shadow-lg lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-shifaa-muted">Total · étape {step + 1}/3</p>
            <p className="text-lg font-semibold">{formatDZD(total)}</p>
          </div>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 0 && (!wilaya || !commune || !address)) {
                  setError("Complétez l'adresse.");
                  return;
                }
                setStep(step + 1);
              }}
              className="btn-primary shrink-0"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !canSubmit}
              onClick={handleConfirm}
              className="btn-primary shrink-0 disabled:opacity-50"
            >
              {submitting ? "…" : payment === "cib" || payment === "edahabia" ? "Payer" : "Confirmer"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
