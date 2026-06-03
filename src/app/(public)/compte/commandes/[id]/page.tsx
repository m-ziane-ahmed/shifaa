"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatDZD } from "@/lib/utils";

type OrderItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  id: string;
  status: string;
  payment: string;
  payment_status?: string;
  total: number;
  subtotal: number;
  discount: number;
  delivery: number;
  wilaya: string;
  commune: string;
  address: string;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Paiement à la livraison (COD)",
  cib: "Carte CIB",
  edahabia: "Carte Edahabia",
};

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace(`/compte?redirect=/compte/commandes/${id}`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user || !id) return;
    fetch(`/api/orders/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order ?? null);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [user, id]);

  function reorder() {
    if (!order) return;
    let count = 0;
    for (const item of order.order_items ?? []) {
      addItem({ id: item.id, name: item.name } as never, item.quantity);
      count += 1;
    }
    if (count > 0) {
      showToast("Articles ajoutés au panier");
      router.push("/panier");
    } else {
      showToast("Aucun article disponible");
    }
  }

  if (loading || !user) return null;

  if (fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-shifaa-muted">Chargement de la commande…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-shifaa-muted mb-4">Commande introuvable.</p>
        <Link href="/compte/commandes" className="text-shifaa-green hover:underline text-sm">
          ← Retour à mes commandes
        </Link>
      </div>
    );
  }

  const items = order.order_items ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/compte/commandes" className="text-sm text-shifaa-green hover:underline">
          ← Mes commandes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-mono text-sm font-semibold text-gray-700">{order.id}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Infos commande */}
      <div className="card-surface p-6 mb-4 space-y-2 text-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <p><span className="text-shifaa-muted">Wilaya :</span> {order.wilaya}</p>
          <p><span className="text-shifaa-muted">Commune :</span> {order.commune}</p>
        </div>
        <p className="text-shifaa-muted">{order.address}</p>
        <p><span className="text-shifaa-muted">Paiement :</span> {PAYMENT_LABELS[order.payment] ?? order.payment}</p>
        <p className="text-xs text-shifaa-muted">
          Passée le {new Date(order.created_at).toLocaleString("fr-DZ")}
        </p>
      </div>

      {/* Articles */}
      <div className="card-surface overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Articles ({items.length})</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {items.length === 0 ? (
            <li className="px-5 py-6 text-center text-sm text-shifaa-muted">Aucun article</li>
          ) : items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-3">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-300 text-xs">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-shifaa-muted">{item.brand}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatDZD(item.price * item.quantity)}</p>
                <p className="text-xs text-shifaa-muted">× {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Total */}
      <div className="card-surface p-6 text-sm space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-shifaa-muted">Sous-total</span>
          <span>{formatDZD(order.subtotal)}</span>
        </div>
        {(order.discount ?? 0) > 0 && (
          <div className="flex justify-between text-shifaa-green">
            <span>Réduction</span>
            <span>−{formatDZD(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-shifaa-muted">Livraison</span>
          <span>{order.delivery === 0 ? "Offerte" : formatDZD(order.delivery)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{formatDZD(order.total)}</span>
        </div>
      </div>

      <button type="button" onClick={reorder} className="btn-primary">
        Commander à nouveau
      </button>
    </div>
  );
}
