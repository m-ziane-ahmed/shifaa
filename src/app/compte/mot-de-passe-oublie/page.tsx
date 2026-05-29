"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDevLink("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message ?? "Demande envoyée.");
    if (data.devResetUrl) setDevLink(data.devResetUrl);
  }

  return (
    <>
      <PageHeader title="Mot de passe oublié" description="Recevez un lien de réinitialisation par e-mail." />
      <div className="mx-auto max-w-md px-4 py-10 md:px-6">
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
          <p className="text-sm text-shifaa-muted">
            Saisissez l&apos;e-mail associé à votre compte. En production, un e-mail vous sera envoyé.
          </p>
          <div>
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          </div>
          {message && <p className="text-sm text-shifaa-green">{message}</p>}
          {devLink && (
            <p className="rounded-xl bg-shifaa-cream p-3 text-xs break-all">
              <strong>Dev :</strong>{" "}
              <Link href={new URL(devLink).pathname + new URL(devLink).search} className="text-shifaa-green underline">
                Lien de réinitialisation
              </Link>
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
        <Link href="/compte" className="mt-4 block text-center text-sm text-shifaa-green hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </>
  );
}
