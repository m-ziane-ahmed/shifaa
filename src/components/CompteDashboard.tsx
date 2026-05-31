"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag, Heart, MapPin, RotateCcw, Star,
  Settings, RefreshCw, ChevronRight,
  Sparkles, User, LogOut, Award
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type Order = { id: string; total: number; status: string; created_at: string; items?: Array<{ name: string; image: string }> };
type RecentProduct = { id: string; slug: string; name: string; image: string; price: number };

const QUICK_LINKS = [
  { href: "/compte/commandes", label: "Mes commandes", icon: ShoppingBag, color: "text-blue-500" },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart, color: "text-red-500" },
  { href: "/compte/routines", label: "Mes routines", icon: RefreshCw, color: "text-shifaa-green" },
  { href: "/compte/adresses", label: "Mes adresses", icon: MapPin, color: "text-green-500" },
  { href: "/compte/retours", label: "Retours", icon: RotateCcw, color: "text-orange-500" },
  { href: "/compte/moderation-avis", label: "Mes avis", icon: Star, color: "text-amber-500" },
  { href: "/compte/preferences", label: "Préférences", icon: Settings, color: "text-purple-500" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente", color: "text-amber-600 bg-amber-50" },
  confirmed: { label: "Confirmée", color: "text-blue-600 bg-blue-50" },
  shipped:   { label: "Expédiée", color: "text-purple-600 bg-purple-50" },
  delivered: { label: "Livrée", color: "text-green-600 bg-green-50" },
  cancelled: { label: "Annulée", color: "text-red-600 bg-red-50" },
};

export function CompteDashboard() {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Charger les commandes récentes
    fetch("/api/orders?limit=3")
      .then((r) => r.json())
      .then((d) => setRecentOrders(d.orders ?? []));
    // Charger les produits récemment consultés depuis localStorage
    try {
      const raw = localStorage.getItem("shifaa-recent");
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        if (ids.length > 0) {
          fetch(`/api/search?ids=${ids.slice(0, 4).join(",")}`)
            .then((r) => r.json())
            .then((d) => setRecentProducts(d.results ?? []));
        }
      }
    } catch {}
    // Points fidélité
    fetch("/api/loyalty").then((r) => r.json()).then((d) => setLoyaltyPoints(d.points ?? 0));
  }, [user]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    }
  }

  if (loading) return <p className="py-10 text-center text-shifaa-muted">Chargement…</p>;

  // ── Non connecté ──────────────────────────────────────────
  if (!user) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card-surface p-8">
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-6">Connexion</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-shifaa-ink">E-mail</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-shifaa-ink">Mot de passe</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full">Se connecter</button>
          </form>
          <p className="mt-3 text-center text-sm">
            <Link href="/compte/mot-de-passe-oublie" className="text-shifaa-green hover:underline">Mot de passe oublié ?</Link>
          </p>
          <p className="mt-4 text-center text-sm text-shifaa-muted">
            Pas encore de compte ?{" "}
            <Link href={`/compte/inscription${redirect !== "/compte" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-medium text-shifaa-green hover:underline">
              Créer un compte
            </Link>
          </p>
        </section>
        <section className="card-surface p-8 flex flex-col justify-center">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-shifaa-lime/30 mb-4">
              <User className="h-8 w-8 text-shifaa-green" />
            </div>
            <h3 className="font-semibold text-shifaa-ink mb-2">Votre espace personnel</h3>
            <p className="text-sm text-shifaa-muted mb-6">Accédez à vos commandes, favoris, routines personnalisées et offres ciblées.</p>
          </div>
          <ul className="space-y-2 opacity-60">
            {QUICK_LINKS.map(({ label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-shifaa-muted px-4 py-2">
                <ChevronRight className="h-4 w-4" />{label}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  // ── Connecté : tableau de bord personnalisé ───────────────
  return (
    <div className="space-y-6">
      {/* Header profil */}
      <div className="card-surface p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-shifaa-green text-white text-2xl font-bold">
          {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-semibold text-shifaa-ink">
            Bonjour, {user.name || "bienvenue"} 👋
          </h2>
          <p className="text-sm text-shifaa-muted">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">{loyaltyPoints} points fidélité</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/compte/preferences"
            className="flex items-center gap-1.5 rounded-xl border border-shifaa-border px-3 py-2 text-xs text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors">
            <Settings className="h-3.5 w-3.5" /> Préférences
          </Link>
          <button type="button" onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl border border-shifaa-border px-3 py-2 text-xs text-shifaa-muted hover:border-red-300 hover:text-red-500 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Déconnecter
          </button>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="card-surface flex items-center gap-3 p-4 hover:shadow-lift hover:border-shifaa-green/30 transition-all group">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-shifaa-ink group-hover:text-shifaa-green text-sm">{label}</span>
            <ChevronRight className="h-4 w-4 text-shifaa-muted ml-auto" />
          </Link>
        ))}
      </div>

      {/* Commandes récentes */}
      {recentOrders.length > 0 && (
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-shifaa-ink flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-shifaa-green" />
              Commandes récentes
            </h3>
            <Link href="/compte/commandes" className="text-xs text-shifaa-green hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50" };
              return (
                <Link key={order.id} href={`/compte/commandes/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-shifaa-cream transition-colors">
                  <div>
                    <p className="text-sm font-medium text-shifaa-ink">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-shifaa-muted">
                      {new Date(order.created_at).toLocaleDateString("fr-DZ")} · {formatDZD(order.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-shifaa-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommander à renouveler */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-shifaa-ink flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-shifaa-green" />
            À renouveler
          </h3>
          <Link href="/compte/commandes" className="text-xs text-shifaa-green hover:underline">Voir historique →</Link>
        </div>
        <p className="text-sm text-shifaa-muted">
          Retrouvez vos produits commandés précédemment et repassez commande en un clic.
        </p>
        <Link href="/compte/commandes"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-shifaa-lime/20 border border-shifaa-lime/40 px-4 py-2 text-sm font-medium text-shifaa-ink hover:bg-shifaa-lime/30 transition-colors">
          <RefreshCw className="h-4 w-4 text-shifaa-green" />
          Voir mes achats précédents
        </Link>
      </div>

      {/* Récemment consultés */}
      {recentProducts.length > 0 && (
        <div className="card-surface p-5">
          <h3 className="font-semibold text-shifaa-ink flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-shifaa-green" />
            Récemment consultés
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentProducts.map((p) => (
              <Link key={p.id} href={`/produit/${p.slug}`}
                className="group flex flex-col rounded-xl border border-shifaa-border bg-white p-2 hover:border-shifaa-green/50 transition-colors">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-shifaa-cream mb-2">
                  <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="100px" />
                </div>
                <p className="text-xs font-medium text-shifaa-ink line-clamp-2">{p.name}</p>
                <p className="text-xs text-shifaa-green font-semibold mt-auto pt-1">{formatDZD(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fidélité & offres */}
      <div className="card-surface p-5 bg-gradient-to-r from-shifaa-green to-[#0f3d3a] text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-shifaa-lime" />
              Programme fidélité
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Vous avez <span className="font-bold text-shifaa-lime">{loyaltyPoints} points</span>
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {loyaltyPoints >= 1000 ? "🎉 Statut VIP débloqué !" : `Plus que ${1000 - loyaltyPoints} pts pour le statut VIP`}
            </p>
          </div>
          <div className="text-right">
            <div className="w-24 h-2 rounded-full bg-white/20 overflow-hidden mb-1">
              <div className="h-full bg-shifaa-lime rounded-full" style={{ width: `${Math.min(100, (loyaltyPoints / 1000) * 100)}%` }} />
            </div>
            <p className="text-xs text-white/60">{loyaltyPoints}/1000 pts VIP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
