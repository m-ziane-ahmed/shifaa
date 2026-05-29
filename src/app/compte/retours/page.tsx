"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import type { OrderRecord, ReturnRequestRecord } from "@/lib/store-types";

export default function RetoursPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRequestRecord[]>([]);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/retours");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
    fetch("/api/returns").then((r) => r.json()).then((d) => setReturns(d.returns ?? []));
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Demande enregistrée — traitement sous 48 h.");
      setReturns((prev) => [data.request, ...prev]);
      setReason("");
    } else {
      setMessage(data.error ?? "Erreur");
    }
  }

  if (loading || !user) return null;

  return (
    <>
      <PageHeader title="Demandes de retour" />
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link href="/compte" className="text-sm text-shifaa-green hover:underline">← Mon compte</Link>
        <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
          <h2 className="font-semibold">Nouvelle demande</h2>
          <select value={orderId} required onChange={(e) => setOrderId(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm">
            <option value="">Commande concernée</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.id} — {new Date(o.createdAt).toLocaleDateString("fr-DZ")}</option>
            ))}
          </select>
          <textarea required placeholder="Motif du retour" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" rows={3} />
          {message && <p className="text-sm text-shifaa-green">{message}</p>}
          <button type="submit" className="btn-primary">Envoyer la demande</button>
        </form>
        {returns.length > 0 && (
          <ul className="mt-8 space-y-3">
            {returns.map((r) => (
              <li key={r.id} className="card-surface p-4 text-sm">
                <span className="font-medium">{r.orderId}</span> — {r.status} · {r.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
