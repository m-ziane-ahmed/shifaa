"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PAYMENT_LABELS } from "@/lib/payment-labels";

function SimulationInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const failed = searchParams.get("failed") === "1";
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <p className="text-shifaa-muted">
        Session de paiement invalide.{" "}
        <Link href="/commande" className="text-shifaa-green hover:underline">
          Retour au checkout
        </Link>
      </p>
    );
  }

  async function complete(success: boolean) {
    if (!token) return;
    setLoading(true);
    const base = window.location.origin;
    window.location.href = `${base}/api/payment/callback?token=${encodeURIComponent(token)}&success=${success ? "1" : "0"}`;
  }

  return (
    <div className="card-surface mx-auto max-w-lg p-8">
      {failed && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Le paiement précédent a échoué. Réessayez ou choisissez un autre mode.
        </p>
      )}
      <p className="text-sm text-shifaa-muted">Mode démonstration Satim / CIB Web</p>
      <h2 className="mt-2 font-display text-xl font-semibold">Passerelle de paiement</h2>
      <p className="mt-4 text-sm text-shifaa-muted">
        En production, vous seriez redirigé vers la passerelle officielle (CIB / Edahabia).
        Ici, simulez le résultat du paiement :
      </p>
      <ul className="mt-4 space-y-1 text-sm">
        <li>{PAYMENT_LABELS.cib}</li>
        <li>{PAYMENT_LABELS.edahabia}</li>
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={loading}
          onClick={() => complete(true)}
          className="btn-primary flex-1"
        >
          {loading ? "Redirection…" : "Paiement réussi"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => complete(false)}
          className="btn-secondary flex-1"
        >
          Paiement refusé
        </button>
      </div>
      <button
        type="button"
        onClick={() => router.push("/commande")}
        className="mt-4 w-full text-center text-sm text-shifaa-green hover:underline"
      >
        Annuler
      </button>
      <p className="mt-6 text-xs text-shifaa-muted">
        Configurez <code className="rounded bg-shifaa-cream px-1">SATIM_GATEWAY_URL</code> pour la
        passerelle réelle.
      </p>
    </div>
  );
}

export default function PaymentSimulationPage() {
  return (
    <>
      <PageHeader
        title="Paiement en ligne"
        description="Simulation passerelle CIB / Edahabia (Satim)"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Suspense fallback={<p className="text-center text-shifaa-muted">Chargement…</p>}>
          <SimulationInner />
        </Suspense>
      </div>
    </>
  );
}
