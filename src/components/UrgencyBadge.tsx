"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, TrendingUp, AlertTriangle } from "lucide-react";

type UrgencyType = "low_stock" | "high_demand" | "trending" | "last_units";

type Props = {
  productId: string;
  stock?: number;
  orderCount24h?: number;
  viewCount1h?: number;
};

export function UrgencyBadge({ stock, orderCount24h, viewCount1h }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Petite animation d'entrée
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Déterminer le type d'urgence
  let type: UrgencyType | null = null;
  let message = "";
  let subtext = "";

  if (stock !== undefined && stock <= 3 && stock > 0) {
    type = "last_units";
    message = `Plus que ${stock} exemplaire${stock > 1 ? "s" : ""} disponible${stock > 1 ? "s" : ""}`;
    subtext = "Commandez maintenant pour garantir votre article";
  } else if (stock !== undefined && stock <= 8 && stock > 3) {
    type = "low_stock";
    message = "Stock limité";
    subtext = `Seulement ${stock} unités restantes`;
  } else if (orderCount24h !== undefined && orderCount24h >= 10) {
    type = "high_demand";
    message = "Forte demande";
    subtext = `${orderCount24h} personnes ont commandé aujourd'hui`;
  } else if (viewCount1h !== undefined && viewCount1h >= 20) {
    type = "trending";
    message = "Produit populaire";
    subtext = `${viewCount1h} personnes regardent ce produit en ce moment`;
  }

  if (!type) return null;

  const configs = {
    last_units: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      iconColor: "text-red-500",
      dot: "bg-red-500",
    },
    low_stock: {
      icon: AlertTriangle,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      iconColor: "text-amber-500",
      dot: "bg-amber-500",
    },
    high_demand: {
      icon: Flame,
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      iconColor: "text-orange-500",
      dot: "bg-orange-500",
    },
    trending: {
      icon: TrendingUp,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      iconColor: "text-blue-500",
      dot: "bg-blue-500",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border ${config.border} ${config.bg} px-3 py-2.5
      transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${config.iconColor}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className={`text-xs font-semibold ${config.text} flex items-center gap-1.5`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
          {message}
        </p>
        <p className={`text-[11px] ${config.text} opacity-80 mt-0.5`}>{subtext}</p>
      </div>
    </div>
  );
}

// ── Livraison prédictive ─────────────────────────────────
type DeliveryEstimateProps = {
  wilaya?: string;
  inStock?: boolean;
};

export function DeliveryEstimate({ wilaya, inStock = true }: DeliveryEstimateProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (!inStock) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-shifaa-muted">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Actuellement indisponible · <Link href="/compte" className="text-shifaa-green hover:underline">Alerte stock</Link></span>
      </div>
    );
  }

  // Estimation livraison selon la wilaya
  const now = new Date();
  const isBeforeNoon = now.getHours() < 12;
  const isAlger = !wilaya || wilaya.toLowerCase().includes("alger");
  const isOran = wilaya?.toLowerCase().includes("oran");

  let delai = "";
  let precision = "";

  if (isAlger) {
    delai = isBeforeNoon ? "Livraison demain" : "Livraison après-demain";
    precision = "Alger et banlieue";
  } else if (isOran) {
    delai = "Livraison dans 2-3 jours";
    precision = "Oran et région";
  } else {
    delai = "Livraison dans 3-5 jours";
    precision = wilaya ? `Wilaya de ${wilaya}` : "Toute l'Algérie";
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5
      transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-emerald-700">{delai}</p>
        <p className="text-[11px] text-emerald-600 opacity-80">{precision} · Paiement à la livraison</p>
      </div>
    </div>
  );
}
