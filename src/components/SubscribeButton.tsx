"use client";

import { useState } from "react";
import { RefreshCw, Check, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
};

type Props = {
  product: Product;
  compact?: boolean;
};

const FREQUENCIES = [
  { value: "weekly", label: "Chaque semaine", discount: 10 },
  { value: "biweekly", label: "Toutes les 2 semaines", discount: 8 },
  { value: "monthly", label: "Chaque mois", discount: 5 },
  { value: "bimonthly", label: "Tous les 2 mois", discount: 5 },
  { value: "quarterly", label: "Chaque trimestre", discount: 3 },
];

export function SubscribeButton({ product, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const selectedFreq = FREQUENCIES.find((f) => f.value === frequency)!;
  const discountedPrice = product.price * (1 - selectedFreq.discount / 100);

  async function subscribe() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/compte/inscription?redirect=/produit/" + product.slug;
        return;
      }

      const nextOrder = new Date();
      if (frequency === "weekly") nextOrder.setDate(nextOrder.getDate() + 7);
      else if (frequency === "biweekly") nextOrder.setDate(nextOrder.getDate() + 14);
      else if (frequency === "monthly") nextOrder.setMonth(nextOrder.getMonth() + 1);
      else if (frequency === "bimonthly") nextOrder.setMonth(nextOrder.getMonth() + 2);
      else if (frequency === "quarterly") nextOrder.setMonth(nextOrder.getMonth() + 3);

      await supabase.from("product_subscriptions").insert({
        user_id: user.id,
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        frequency,
        discount_pct: selectedFreq.discount,
        next_order_at: nextOrder.toISOString(),
        status: "active",
      });

      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-shifaa-border px-3 py-2 text-xs font-medium text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors">
        <RefreshCw className="h-3.5 w-3.5" />
        S&apos;abonner & économiser
      </button>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-shifaa-green/30 bg-shifaa-green/5 px-4 py-3 text-sm font-medium text-shifaa-green hover:bg-shifaa-green/10 transition-colors">
        <span className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          S&apos;abonner & économiser {selectedFreq.discount}%
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-2xl border border-shifaa-border bg-white p-4 shadow-xl">
          <p className="text-xs font-semibold text-shifaa-muted uppercase tracking-wide mb-3">
            Choisissez la fréquence
          </p>
          <div className="space-y-1.5 mb-4">
            {FREQUENCIES.map((f) => (
              <button key={f.value} type="button" onClick={() => setFrequency(f.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors
                  ${frequency === f.value ? "bg-shifaa-green/10 text-shifaa-green font-medium" : "hover:bg-gray-50 text-shifaa-ink"}`}>
                <span>{f.label}</span>
                <span className="text-xs font-semibold text-shifaa-green">-{f.discount}%</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-gray-50 p-3 mb-3 text-sm">
            <div className="flex justify-between text-shifaa-muted mb-1">
              <span>Prix unitaire</span>
              <span>{product.price.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between font-semibold text-shifaa-green">
              <span>Votre prix abonné</span>
              <span>{Math.round(discountedPrice).toLocaleString()} DZD</span>
            </div>
          </div>

          <button type="button" onClick={subscribe} disabled={loading || success}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors
              ${success ? "bg-emerald-500" : "bg-shifaa-green hover:bg-shifaa-dark"}`}>
            {success ? (
              <><Check className="h-4 w-4" />Abonnement activé !</>
            ) : loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />Activation…</>
            ) : (
              <><RefreshCw className="h-4 w-4" />Confirmer l&apos;abonnement</>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-shifaa-muted">
            Annulable à tout moment depuis votre compte
          </p>
        </div>
      )}
    </div>
  );
}
