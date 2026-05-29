"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";

export default function InscriptionForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/compte";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, name);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur à l'inscription");
    }
  }

  return (
    <>
      <PageHeader title="Créer un compte" />
      <div className="mx-auto max-w-md px-4 py-10 md:px-6">
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Mot de passe (8 car. min.)</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">S&apos;inscrire</button>
        </form>
        <Link href="/compte" className="mt-4 block text-center text-sm text-shifaa-green hover:underline">
          Déjà un compte ? Se connecter
        </Link>
      </div>
    </>
  );
}
