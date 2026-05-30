"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { WILAYAS } from "@/data/wilayas";
import { formatDZD } from "@/lib/utils";
import type { OrderRecord } from "@/lib/store-types";

export default function CommandesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/commandes");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []));
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <PageHeader title="Mes commandes" />
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link href="/compte" className="text-sm text-shifaa-green hover:underline">← Mon compte</Link>
        {orders.length === 0 ? (
          <p className="mt-8 text-shifaa-muted">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="card-surface p-6">
                <Link href={`/compte/commandes/${o.id}`} className="block hover:opacity-90">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold">{o.id}</span>
                    <span className="text-sm capitalize text-shifaa-green">{o.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-shifaa-muted">
                    {new Date(o.createdAt).toLocaleDateString("fr-DZ")} ·{" "}
                    {WILAYAS.find((w) => w.code === o.wilaya)?.name ?? o.wilaya}
                  </p>
                  <p className="mt-2 text-sm">{o.items.length} article(s) · {formatDZD(o.total)}</p>
                  <span className="mt-2 inline-block text-sm font-medium text-shifaa-green">
                    Voir le détail →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
