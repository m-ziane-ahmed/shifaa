"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoyaltyBadge } from "@/components/LoyaltyBadge";

const LINKS = [
  { href: "/compte/commandes", label: "Historique de commandes" },
  { href: "/compte/adresses", label: "Adresses de livraison" },
  { href: "/compte/favoris", label: "Liste d'envies / favoris" },
  { href: "/comparateur", label: "Comparateur produits" },
  { href: "/compte/preferences", label: "Préférences de communication" },
  { href: "/compte/retours", label: "Demandes de retour" },
  { href: "/compte/moderation-avis", label: "Modération avis (admin)" },
];

export function CompteDashboard() {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  if (loading) {
    return <p className="py-10 text-center text-shifaa-muted">Chargement…</p>;
  }

  if (user) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <section className="card-surface p-8">
          <h2 className="font-semibold">Bonjour, {user.name}</h2>
          <p className="mt-2 text-sm text-shifaa-muted">{user.email}</p>
          <LoyaltyBadge />
          <button type="button" onClick={() => logout()} className="btn-secondary mt-6">
            Se déconnecter
          </button>
        </section>
        <section className="card-surface p-8">
          <h2 className="font-semibold">Espace client</h2>
          <ul className="mt-6 space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-shifaa-cream">
                  <span className="text-sm font-medium">{l.label}</span>
                  <span className="text-shifaa-muted">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="card-surface p-8">
        <h2 className="font-semibold">Connexion</h2>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">Se connecter</button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/compte/mot-de-passe-oublie" className="text-shifaa-green hover:underline">
            Mot de passe oublié ?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-shifaa-muted">
          Pas encore de compte ?{" "}
          <Link href={`/compte/inscription${redirect !== "/compte" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-medium text-shifaa-green hover:underline">
            Créer un compte
          </Link>
        </p>
      </section>
      <section className="card-surface p-8">
        <h2 className="font-semibold">Espace client</h2>
        <p className="mt-4 text-sm text-shifaa-muted">
          Connectez-vous pour accéder à vos commandes, adresses et retours.
        </p>
        <ul className="mt-6 space-y-3 opacity-60">
          {LINKS.map((l) => (
            <li key={l.href}>
              <span className="flex items-center justify-between rounded-xl px-4 py-3 text-sm">{l.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
