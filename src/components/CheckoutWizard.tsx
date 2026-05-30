"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Truck, CheckCircle, ChevronRight, Shield, User, Phone, Mail, MapPin, AlertCircle, Headphones } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCartTotals } from "@/hooks/useCartTotals";
import { WILAYAS } from "@/data/wilayas";
import { formatDZD } from "@/lib/utils";
import type { AddressRecord } from "@/lib/store-types";

const STEPS = [
  { id: 0, label: "Livraison", icon: Truck },
  { id: 1, label: "Paiement", icon: CreditCard },
  { id: 2, label: "Confirmation", icon: CheckCircle },
];

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
  const [saveAddress, setSaveAddress] = useState(true);

  // Pré-remplissage si connecté
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
        .then((d) => {
          const addrs = d.addresses ?? [];
          setSavedAddresses(addrs);
          const def = addrs.find((a: AddressRecord) => a.isDefault);
          if (def) {
            setSelectedAddressId(def.id);
            setWilaya(def.wilaya);
            setCommune(def.commune);
            setAddress(def.address);
            setPhone(def.phone);
          }
        });
    }
  }, [user]);

  function applyAddress(id: string, addresses = savedAddresses) {
    setSelectedAddressId(id);
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    setWilaya(addr.wilaya);
    setCommune(addr.commune);
    setAddress(addr.address);
    setPhone(addr.phone);
  }

  useEffect(() => {
    if (!authLoading && items.length === 0) router.replace("/panier");
  }, [items.length, authLoading, router]);

  function validateStep0() {
    if (!wilaya) return "Sélectionnez votre wilaya";
    if (!commune.trim()) return "Indiquez votre commune";
    if (!address.trim()) return "Indiquez votre adresse";
    return null;
  }

  function validateStep1() {
    if (!firstName.trim()) return "Prénom requis";
    if (!lastName.trim()) return "Nom requis";
    if (!phone.trim()) return "Téléphone requis";
    if (!email.trim()) return "E-mail requis";
    return null;
  }

  function nextStep() {
    if (step === 0) {
      const err = validateStep0();
      if (err) { setError(err); return; }
    }
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setError("");
    setStep((s) => Math.min(2, s + 1));
  }

  async function handleConfirm() {
    if (!user && !checkoutAsGuest) {
      setError("Connectez-vous ou continuez en invité.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        items, subtotal, discount,
        promoCode: promo?.code,
        delivery, total,
        deliveryMode, wilaya, commune,
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

  const selectedWilaya = WILAYAS.find((w) => w.code === wilaya);

  if (authLoading || items.length === 0) {
    return <p className="py-10 text-center text-shifaa-muted">Chargement…</p>;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 pb-32 md:pb-12">

        {/* ── Barre d'étapes ───────────────────────────────── */}
        <nav className="mb-8" aria-label="Étapes">
          <div className="flex items-center">
            {STEPS.map(({ id, label, icon: Icon }, i) => (
              <div key={id} className="flex flex-1 items-center">
                <button type="button"
                  onClick={() => id < step && setStep(id)}
                  disabled={id >= step}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                    ${id < step ? "border-shifaa-green bg-shifaa-green text-white"
                      : id === step ? "border-shifaa-green bg-white text-shifaa-green"
                      : "border-gray-200 bg-white text-gray-300"}`}>
                    {id < step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${id === step ? "text-shifaa-green" : id < step ? "text-shifaa-ink" : "text-gray-400"}`}>
                    {label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${id < step ? "bg-shifaa-green" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* ── Achat invité ─────────────────────────────────── */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-shifaa-border bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-shifaa-green" />
              <h3 className="font-medium text-shifaa-ink">Votre compte</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/compte?redirect=/commande`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-shifaa-green text-shifaa-green py-2.5 text-sm font-medium hover:bg-shifaa-lime/10 transition-colors">
                <User className="h-4 w-4" />
                Se connecter
              </Link>
              <Link href={`/compte/inscription?redirect=/commande`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-shifaa-border text-shifaa-muted py-2.5 text-sm hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                Créer un compte
              </Link>
              <label className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-shifaa-cream py-2.5 text-sm cursor-pointer hover:bg-shifaa-lime/20 transition-colors">
                <input type="checkbox" checked={checkoutAsGuest} onChange={(e) => setCheckoutAsGuest(e.target.checked)}
                  className="rounded accent-shifaa-green" />
                <span className="font-medium text-shifaa-ink">Commander en invité</span>
              </label>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Formulaire ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ÉTAPE 0 : Livraison */}
            {step === 0 && (
              <div className="card-surface p-6 space-y-6">
                <h2 className="flex items-center gap-2 font-semibold text-shifaa-ink">
                  <Truck className="h-5 w-5 text-shifaa-green" />
                  Adresse de livraison
                </h2>

                {/* Adresses sauvegardées */}
                {savedAddresses.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-shifaa-ink">Adresse enregistrée</label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {savedAddresses.map((a) => (
                        <label key={a.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all
                            ${selectedAddressId === a.id ? "border-shifaa-green bg-shifaa-lime/10" : "border-shifaa-border hover:border-shifaa-green/50"}`}>
                          <input type="radio" name="saved-addr" checked={selectedAddressId === a.id}
                            onChange={() => applyAddress(a.id)} className="mt-1 accent-shifaa-green" />
                          <div className="text-sm">
                            <p className="font-medium text-shifaa-ink">{a.label}</p>
                            <p className="text-shifaa-muted text-xs">{a.commune}, {a.wilaya}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button type="button" onClick={() => setSelectedAddressId("")}
                      className="mt-2 text-xs text-shifaa-muted hover:text-shifaa-green">
                      + Utiliser une nouvelle adresse
                    </button>
                  </div>
                )}

                {/* Mode livraison */}
                <div>
                  <label className="text-sm font-medium text-shifaa-ink">Mode de livraison</label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {[
                      { id: "home" as const, label: "Livraison à domicile", sub: "Selon couverture wilaya", icon: "🏠" },
                      { id: "relay" as const, label: "Point relais", sub: "Retrait sur place", icon: "📦" },
                    ].map((opt) => (
                      <label key={opt.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all
                          ${deliveryMode === opt.id ? "border-shifaa-green bg-shifaa-lime/10" : "border-shifaa-border hover:border-shifaa-green/40"}`}>
                        <input type="radio" name="delivery" checked={deliveryMode === opt.id}
                          onChange={() => setDeliveryMode(opt.id)} className="sr-only" />
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-shifaa-ink">{opt.label}</p>
                          <p className="text-xs text-shifaa-muted">{opt.sub}</p>
                        </div>
                        {deliveryMode === opt.id && <CheckCircle className="h-5 w-5 text-shifaa-green ml-auto shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Adresse */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wilaya" className="text-sm font-medium text-shifaa-ink">Wilaya *</label>
                    <select id="wilaya" required value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30">
                      <option value="">Sélectionner une wilaya</option>
                      {WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                    {selectedWilaya && (
                      <p className="mt-1 text-xs text-shifaa-muted">
                        Délai estimé : {selectedWilaya.deliveryDays}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="commune" className="text-sm font-medium text-shifaa-ink">Commune *</label>
                    <input id="commune" required value={commune} onChange={(e) => setCommune(e.target.value)}
                      placeholder="Ex: Hydra"
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="adresse" className="text-sm font-medium text-shifaa-ink">Adresse complète *</label>
                    <textarea id="adresse" rows={2} required value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="N° et nom de rue, résidence, étage..."
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 resize-none" />
                  </div>
                </div>

                {user && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-shifaa-muted">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)}
                      className="rounded accent-shifaa-green" />
                    Enregistrer cette adresse pour mes prochaines commandes
                  </label>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 1 : Paiement + Coordonnées */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Coordonnées */}
                <div className="card-surface p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-shifaa-ink mb-4">
                    <User className="h-5 w-5 text-shifaa-green" />
                    Vos coordonnées
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="prenom" className="text-sm font-medium text-shifaa-ink">Prénom *</label>
                      <div className="relative mt-1">
                        <input id="prenom" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="nom" className="text-sm font-medium text-shifaa-ink">Nom *</label>
                      <input id="nom" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                    </div>
                    <div>
                      <label htmlFor="tel" className="text-sm font-medium text-shifaa-ink">Téléphone *</label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-shifaa-muted" />
                        <input id="tel" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="+213 7 XX XX XX XX"
                          className="w-full rounded-xl border border-shifaa-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-shifaa-ink">E-mail *</label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-shifaa-muted" />
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-shifaa-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode paiement */}
                <div className="card-surface p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-shifaa-ink mb-4">
                    <CreditCard className="h-5 w-5 text-shifaa-green" />
                    Mode de paiement
                  </h2>
                  <div className="space-y-2">
                    {[
                      { id: "cod" as const, label: "Paiement à la livraison", sub: "Espèces à réception — gratuit", icon: "💵", badge: null },
                      { id: "cib" as const, label: "Carte CIB", sub: "Paiement en ligne sécurisé", icon: "💳", badge: "Recommandé" },
                      { id: "edahabia" as const, label: "Edahabia (CCP)", sub: "Paiement en ligne sécurisé", icon: "📱", badge: null },
                    ].map((opt) => (
                      <label key={opt.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all
                          ${payment === opt.id ? "border-shifaa-green bg-shifaa-lime/10" : "border-shifaa-border hover:border-shifaa-green/40"}`}>
                        <input type="radio" name="payment" checked={payment === opt.id}
                          onChange={() => setPayment(opt.id)} className="sr-only" />
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-shifaa-ink">{opt.label}</span>
                            {opt.badge && (
                              <span className="rounded-full bg-shifaa-green text-white px-2 py-0.5 text-[10px] font-semibold">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-shifaa-muted">{opt.sub}</p>
                        </div>
                        {payment === opt.id && <CheckCircle className="h-5 w-5 text-shifaa-green shrink-0" />}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-shifaa-cream p-3">
                    <Lock className="h-4 w-4 text-shifaa-green shrink-0" />
                    <p className="text-xs text-shifaa-muted">
                      Vos données sont chiffrées et protégées. Aucun numéro de carte n&apos;est stocké.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2 : Confirmation */}
            {step === 2 && (
              <div className="card-surface p-6 space-y-5">
                <h2 className="font-semibold text-shifaa-ink">Vérification avant paiement</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Livraison */}
                  <div className="rounded-xl bg-shifaa-cream p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-shifaa-muted mb-2 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Livraison
                    </p>
                    <p className="text-sm font-medium text-shifaa-ink">
                      {deliveryMode === "home" ? "Domicile" : "Point relais"}
                    </p>
                    <p className="text-sm text-shifaa-muted">
                      {selectedWilaya?.name ?? wilaya}, {commune}
                    </p>
                    <p className="text-sm text-shifaa-muted">{address}</p>
                    {selectedWilaya && (
                      <p className="text-xs text-shifaa-green mt-1">Délai : {selectedWilaya.deliveryDays}</p>
                    )}
                  </div>
                  {/* Contact */}
                  <div className="rounded-xl bg-shifaa-cream p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-shifaa-muted mb-2 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Contact
                    </p>
                    <p className="text-sm font-medium text-shifaa-ink">{firstName} {lastName}</p>
                    <p className="text-sm text-shifaa-muted">{phone}</p>
                    <p className="text-sm text-shifaa-muted">{email}</p>
                  </div>
                </div>

                {/* Paiement sélectionné */}
                <div className="rounded-xl bg-shifaa-cream p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-shifaa-muted mb-1 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Paiement
                  </p>
                  <p className="text-sm font-medium text-shifaa-ink">
                    {payment === "cod" ? "💵 À la livraison" : payment === "cib" ? "💳 CIB" : "📱 Edahabia"}
                  </p>
                </div>

                {/* Articles */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-shifaa-muted mb-2">
                    Articles commandés
                  </p>
                  <div className="space-y-2">
                    {items.map((i) => (
                      <div key={i.productId} className="flex items-center gap-3 text-sm">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream">
                          <Image src={i.image} alt={i.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <p className="flex-1 text-shifaa-muted truncate">{i.name} × {i.quantity}</p>
                        <p className="font-medium shrink-0">{formatDZD(i.price * i.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-shifaa-muted border-t border-shifaa-border pt-3">
                  En validant, vous acceptez nos{" "}
                  <Link href="/legal/cgv" target="_blank" className="text-shifaa-green underline">CGV</Link>{" "}
                  et notre{" "}
                  <Link href="/legal/confidentialite" target="_blank" className="text-shifaa-green underline">politique de confidentialité</Link>.
                </p>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Aide contextuelle */}
            <div className="flex items-center gap-3 rounded-xl border border-shifaa-border bg-white p-3 text-sm text-shifaa-muted">
              <Headphones className="h-5 w-5 text-shifaa-green shrink-0" />
              <p>Une question ? <Link href="/contact" className="text-shifaa-green hover:underline">Contactez-nous</Link> ou appelez le <a href="tel:+213770708090" className="text-shifaa-green hover:underline">+213 7 70 70 80 90</a></p>
            </div>
          </div>

          {/* ── Récapitulatif latéral ──────────────────────── */}
          <aside className="hidden lg:block space-y-4">
            <div className="card-surface p-5 sticky top-24">
              <h2 className="font-semibold text-shifaa-ink mb-4">Votre commande</h2>

              <div className="space-y-2 mb-4">
                {items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-2.5 text-sm">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream">
                      <Image src={i.image} alt={i.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <p className="flex-1 text-shifaa-muted truncate text-xs">{i.name} ×{i.quantity}</p>
                    <p className="font-medium text-xs shrink-0">{formatDZD(i.price * i.quantity)}</p>
                  </div>
                ))}
              </div>

              <dl className="space-y-1.5 border-t border-shifaa-border pt-3 text-sm">
                <div className="flex justify-between text-shifaa-muted">
                  <dt>Sous-total</dt>
                  <dd>{formatDZD(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Réduction</dt>
                    <dd>−{formatDZD(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-shifaa-muted">
                  <dt>Livraison</dt>
                  <dd className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                    {delivery === 0 ? "Offerte" : formatDZD(delivery)}
                  </dd>
                </div>
                {selectedWilaya && (
                  <div className="flex justify-between text-xs text-shifaa-muted">
                    <dt>Délai estimé</dt>
                    <dd>{selectedWilaya.deliveryDays}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-shifaa-border pt-2 font-bold text-base">
                  <dt>Total TTC</dt>
                  <dd>{formatDZD(total)}</dd>
                </div>
              </dl>

              {/* Bouton action principal */}
              {step < 2 ? (
                <button type="button" onClick={nextStep}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-3 text-sm font-semibold text-white hover:bg-[#0f3d3a] transition-colors shadow">
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" disabled={submitting || (!user && !checkoutAsGuest)} onClick={handleConfirm}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-3.5 text-sm font-bold text-white hover:bg-[#0f3d3a] transition-colors shadow disabled:opacity-50">
                  <Lock className="h-4 w-4" />
                  {submitting ? "Validation…" : payment === "cod" ? "Confirmer la commande" : "Payer maintenant"}
                </button>
              )}

              {step > 0 && (
                <button type="button" onClick={() => { setStep(step - 1); setError(""); }}
                  className="mt-2 w-full text-xs text-shifaa-muted hover:text-shifaa-green transition-colors">
                  ← Modifier l&apos;étape précédente
                </button>
              )}

              {/* Sécurité */}
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-shifaa-muted">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-shifaa-green" />SSL</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-shifaa-green" />Sécurisé</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Sticky bottom mobile ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white px-4 py-3 shadow-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-shifaa-muted">Total · étape {step + 1}/3</p>
            <p className="text-base font-bold text-shifaa-ink">{formatDZD(total)}</p>
          </div>
          <div className="flex flex-1 gap-2">
            {step > 0 && (
              <button type="button" onClick={() => { setStep(step - 1); setError(""); }}
                className="rounded-xl border border-shifaa-border px-3 py-2.5 text-sm text-shifaa-muted hover:border-shifaa-green transition-colors">
                ←
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-shifaa-green py-2.5 text-sm font-bold text-white hover:bg-[#0f3d3a]">
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" disabled={submitting || (!user && !checkoutAsGuest)} onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-shifaa-green py-2.5 text-sm font-bold text-white hover:bg-[#0f3d3a] disabled:opacity-50">
                <Lock className="h-4 w-4" />
                {submitting ? "…" : payment === "cod" ? "Confirmer" : "Payer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
