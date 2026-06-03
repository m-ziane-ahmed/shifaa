"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDZD } from "@/lib/utils";

type Order = {
  id: string; status: string; payment: string; total: number;
  subtotal: number; discount: number; delivery: number;
  wilaya: string; commune: string; address: string; delivery_mode: string;
  guest_name: string; guest_phone: string; guest_email: string;
  created_at: string;
  order_items: Array<{ id: string; name: string; brand: string; price: number; quantity: number }>;
  profiles: { name: string; phone: string; email: string } | null;
};

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800", confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800", delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function CommandeDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) { setError("ID manquant"); setLoading(false); return; }
    fetch(`/api/admin/commandes?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order ?? null); setLoading(false); })
      .catch(() => { setError("Erreur de chargement"); setLoading(false); });
  }, [id]);

  async function updateStatus(status: string) {
    if (!id) return;
    setUpdating(true);
    await fetch(`/api/admin/commandes?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrder((o) => o ? { ...o, status } : o);
    setUpdating(false);
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement de la commande…</div>;
  if (error || !order) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error || "Commande introuvable"}</p>
      <Link href="/admin/commandes" className="text-shifaa-green hover:underline">← Retour aux commandes</Link>
    </div>
  );

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const items = order.order_items ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/commandes" className="text-gray-400 hover:text-gray-600 text-sm">← Commandes</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 font-mono">{order.id}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progression statut */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex flex-wrap gap-4 mb-4">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                ${i <= currentIdx ? "bg-shifaa-green text-white" : "bg-gray-100 text-gray-400"}`}>
                {i < currentIdx ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${i <= currentIdx ? "text-shifaa-green" : "text-gray-400"}`}>
                {STATUS_LABELS[s]}
              </span>
            </div>
          ))}
        </div>
        {order.status !== "cancelled" && (
          <div className="flex gap-2 flex-wrap">
            {STATUS_STEPS.filter((s) => s !== order.status).map((s) => (
              <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                → {STATUS_LABELS[s]}
              </button>
            ))}
            <button onClick={() => updateStatus("cancelled")} disabled={updating}
              className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
              ✕ Annuler
            </button>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-3">Client</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Nom :</span> {order.guest_name ?? order.profiles?.name ?? "—"}</p>
            <p><span className="text-gray-500">Tél :</span> {order.guest_phone ?? order.profiles?.phone ?? "—"}</p>
            <p><span className="text-gray-500">Email :</span> {order.guest_email ?? order.profiles?.email ?? "Invité"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-3">Livraison</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Wilaya :</span> {order.wilaya}</p>
            <p><span className="text-gray-500">Commune :</span> {order.commune}</p>
            <p><span className="text-gray-500">Adresse :</span> {order.address}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-3">Paiement</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Méthode :</span> <span className="uppercase font-medium">{order.payment}</span></p>
            <div className="pt-2 border-t border-gray-100 space-y-1 mt-2">
              <p className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatDZD(order.subtotal)}</span></p>
              {order.discount > 0 && <p className="flex justify-between text-green-600"><span>Remise</span><span>−{formatDZD(order.discount)}</span></p>}
              <p className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{order.delivery === 0 ? "Offerte" : formatDZD(order.delivery)}</span></p>
              <p className="flex justify-between font-semibold pt-1 border-t border-gray-100">
                <span>Total</span><span>{formatDZD(order.total)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Articles ({items.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Produit</th>
              <th className="px-4 py-3 text-right">Prix</th>
              <th className="px-4 py-3 text-right">Qté</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun article</td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatDZD(item.price)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">{formatDZD(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4">Passée le {new Date(order.created_at).toLocaleString("fr-DZ")}</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement…</div>}>
      <CommandeDetail />
    </Suspense>
  );
}
