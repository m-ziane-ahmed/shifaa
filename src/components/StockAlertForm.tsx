"use client";

import { FormEvent, useState } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function StockAlertForm({ productId, productName }: { productId: string; productName: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/stock-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email }),
    });
    setLoading(false);
    if (res.ok) {
      showToast("Alerte enregistrée — nous vous préviendrons");
      setEmail("");
    } else {
      showToast("Erreur lors de l'inscription");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
        <Bell className="h-4 w-4" />
        Prévenez-moi quand {productName} sera disponible
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre e-mail"
          className="flex-1 rounded-lg border border-shifaa-border px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0 py-2 text-sm">
          {loading ? "…" : "M'alerter"}
        </button>
      </div>
    </form>
  );
}
