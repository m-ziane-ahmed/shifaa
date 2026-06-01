"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatDZD } from "@/lib/utils";

type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

type PastOrder = {
  id: string;
  created_at: string;
  items: OrderItem[];
  total: number;
};

export function ReorderWidget() {
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("orders")
      .select("id, created_at, items, total")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || orders.length === 0) return null;

  async function reorder(order: PastOrder) {
    // Ajouter tous les items au panier via l'event
    order.items.forEach((item) => {
      window.dispatchEvent(new CustomEvent("shifaa:add-to-cart", {
        detail: { slug: item.slug, quantity: item.quantity }
      }));
    });
  }

  return (
    <section className="rounded-2xl border border-shifaa-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <RotateCcwIcon className="h-5 w-5 text-shifaa-green" />
        <h2 className="font-semibold text-shifaa-ink">Racheter en un clic</h2>
        <span className="ml-auto">
          <Link href="/compte/commandes" className="text-xs text-shifaa-green hover:underline">
            Toutes les commandes →
          </Link>
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green/40 transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-shifaa-muted mb-1">
                {new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}{formatDZD(order.total)}
              </p>
              <div className="flex flex-wrap gap-1">
                {(order.items as OrderItem[]).slice(0, 3).map((item) => (
                  <span key={item.slug} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-shifaa-ink truncate max-w-[120px]">
                    {item.name}
                  </span>
                ))}
                {(order.items as OrderItem[]).length > 3 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-shifaa-muted">
                    +{(order.items as OrderItem[]).length - 3}
                  </span>
                )}
              </div>
            </div>
            <button type="button" onClick={() => reorder(order)}
              className="flex items-center gap-1.5 rounded-xl bg-shifaa-green px-3 py-2 text-xs font-semibold text-white hover:bg-shifaa-dark transition-colors shrink-0">
              <ShoppingCart className="h-3.5 w-3.5" />
              Racheter
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Recommandations IA ────────────────────────────────────
type RecoProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  reason: string;
  score: number;
};

export function AiRecommendations({ context }: { context?: string }) {
  const [products, setProducts] = useState<RecoProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Données de démonstration — à remplacer par l'API de recommandation
    const demo: RecoProduct[] = [
      { id: "1", slug: "serum-vitamine-c-svr", name: "Sérum Vitamine C", brand: "SVR", price: 3200, reason: "Complète votre routine hydratante", score: 92 },
      { id: "2", slug: "spf50-bioderma", name: "SPF 50+ Photoderm", brand: "Bioderma", price: 2800, reason: "Recommandé pour votre type de peau", score: 88 },
      { id: "3", slug: "gel-nettoyant-avene", name: "Gel Nettoyant Doux", brand: "Avène", price: 1800, reason: "Souvent acheté avec vos produits", score: 85 },
    ];
    setTimeout(() => { setProducts(demo); setLoading(false); }, 500);
  }, [context]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-shifaa-green" />
        <h3 className="text-sm font-semibold text-shifaa-ink">Recommandé pour vous</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <Link key={p.id} href={`/produit/${p.slug}`}
            className="flex flex-col rounded-2xl border border-shifaa-border bg-white p-3 hover:border-shifaa-green transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-shifaa-muted">{p.brand}</span>
              <span className="rounded-full bg-shifaa-green/10 px-1.5 py-0.5 text-[10px] font-bold text-shifaa-green">
                {p.score}%
              </span>
            </div>
            <p className="text-sm font-semibold text-shifaa-ink group-hover:text-shifaa-green line-clamp-2 mb-1">{p.name}</p>
            <p className="text-[10px] text-shifaa-muted mb-2 italic">{p.reason}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-sm font-bold text-shifaa-green">{p.price.toLocaleString()} DZD</span>
              <ArrowRight className="h-3.5 w-3.5 text-shifaa-muted group-hover:text-shifaa-green" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Icône locale
function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
    </svg>
  );
}
