"use client";

import { FormEvent, useState } from "react";
import { WILAYAS } from "@/data/wilayas";
import type { OrderRecord } from "@/lib/store-types";

const STATUS_STEPS = [
  { key: "confirmed", label: "Confirmée" },
  { key: "shipped", label: "Expédiée" },
  { key: "delivered", label: "Livrée" },
];

export default function SuiviForm() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Commande introuvable");
      return;
    }
    setOrder(data.order);
  }

  const stepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <>
      <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
        <div>
          <label htmlFor="order" className="text-sm font-medium">Numéro de commande</label>
          <input
            id="order"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Ex. SHF-1734567890"
            className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email-suivi" className="text-sm font-medium">E-mail</label>
          <input
            id="email-suivi"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Recherche…" : "Suivre"}
        </button>
      </form>

      {order && (
        <div className="card-surface mt-6 p-6">
          <h2 className="font-semibold">Commande {order.id}</h2>
          <p className="mt-1 text-sm text-shifaa-muted">
            {new Date(order.createdAt).toLocaleDateString("fr-DZ")} ·{" "}
            {WILAYAS.find((w) => w.code === order.wilaya)?.name}
          </p>
          <ol className="mt-6 space-y-4">
            {STATUS_STEPS.map((step, i) => (
              <li key={step.key} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i <= stepIndex ? "bg-shifaa-green text-white" : "bg-shifaa-cream text-shifaa-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={i <= stepIndex ? "font-medium" : "text-shifaa-muted"}>{step.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm">
            Statut actuel : <strong className="capitalize">{order.status}</strong>
          </p>
        </div>
      )}
    </>
  );
}
