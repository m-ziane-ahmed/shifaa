"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Lien invalide ou expiré.");
      return;
    }
    router.push("/compte");
  }

  if (!token) {
    return <p className="text-sm text-red-600">Lien invalide. Demandez un nouveau lien.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
      <div>
        <label htmlFor="password" className="text-sm font-medium">Nouveau mot de passe</label>
        <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="confirm" className="text-sm font-medium">Confirmer</label>
        <input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Mise à jour…" : "Réinitialiser"}
      </button>
    </form>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <>
      <PageHeader title="Nouveau mot de passe" />
      <div className="mx-auto max-w-md px-4 py-10 md:px-6">
        <Suspense fallback={<p className="text-shifaa-muted">Chargement…</p>}>
          <ResetForm />
        </Suspense>
        <Link href="/compte" className="mt-4 block text-center text-sm text-shifaa-green hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </>
  );
}
