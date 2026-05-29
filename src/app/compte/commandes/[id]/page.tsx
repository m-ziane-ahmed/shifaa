"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { PRODUCTS } from "@/data/products";
import { WILAYAS } from "@/data/wilayas";
import { PAYMENT_LABELS } from "@/lib/payment-labels";
import { formatDZD } from "@/lib/utils";
import type { OrderRecord } from "@/lib/store-types";

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(`/compte?redirect=/compte/commandes/${id}`);
  }, [user, loading, router, id]);

  useEffect(() => {
    if (!user || !id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order ?? null));
  }, [user, id]);

  function reorder() {
    if (!order) return;
    let count = 0;
    for (const item of order.items) {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (product?.inStock) {
        addItem(product, item.quantity);
        count += 1;
      }
    }
    if (count > 0) {
      showToast("Articles ajoutés au panier");
      router.push("/panier");
    } else {
      showToast("Aucun article disponible");
    }
  }

  if (loading || !user) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <p className="text-shifaa-muted">Chargement ou commande introuvable…</p>
      </div>
    );
  }

  const paymentLabel =
    order.payment === "cod"
      ? PAYMENT_LABELS.cod
      : order.payment === "cib"
        ? PAYMENT_LABELS.cib
        : PAYMENT_LABELS.edahabia;

  return (
    <>
      <PageHeader title={`Commande ${order.id}`} />
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link href="/compte/commandes" className="text-sm text-shifaa-green hover:underline">
          ← Mes commandes
        </Link>

        <div className="mt-6 card-surface space-y-4 p-6">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-semibold capitalize">{order.status}</span>
            <span className="text-sm text-shifaa-muted">
              {new Date(order.createdAt).toLocaleString("fr-DZ")}
            </span>
          </div>
          <p className="text-sm">
            {WILAYAS.find((w) => w.code === order.wilaya)?.name ?? order.wilaya} · {order.commune}
          </p>
          <p className="text-sm text-shifaa-muted">{order.address}</p>
          <p className="text-sm">
            {paymentLabel}
            {order.paymentStatus && ` · ${order.paymentStatus}`}
            {order.paymentRef && ` · Réf. ${order.paymentRef}`}
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {order.items.map((item) => (
            <li key={item.productId} className="card-surface flex gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream">
                <Image src={item.image} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-shifaa-muted">
                  × {item.quantity} · {formatDZD(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-6 card-surface space-y-2 p-6 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatDZD(order.subtotal)}</dd>
          </div>
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between text-shifaa-green">
              <dt>Réduction</dt>
              <dd>−{formatDZD(order.discount!)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{order.delivery === 0 ? "Offerte" : formatDZD(order.delivery)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <dt>Total</dt>
            <dd>{formatDZD(order.total)}</dd>
          </div>
        </dl>

        <button type="button" onClick={reorder} className="btn-primary mt-8">
          Commander à nouveau
        </button>
      </div>
    </>
  );
}
