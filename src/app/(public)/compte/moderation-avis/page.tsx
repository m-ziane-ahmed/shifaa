"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import type { ReviewRecord } from "@/lib/store-types";

export default function ModerationAvisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/compte");
  }, [user, loading, router]);

  function load() {
    fetch("/api/reviews?pending=1")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function moderate(id: string, action: "approve" | "reject") {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    load();
  }

  if (loading || !user) return null;

  return (
    <>
      <PageHeader title="Modération des avis" description="Validation simplifiée des avis clients." />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <Link href="/compte" className="text-sm text-shifaa-green hover:underline">← Mon compte</Link>
        {reviews.length === 0 ? (
          <p className="mt-8 text-shifaa-muted">Aucun avis en attente.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="card-surface p-4">
                <p className="text-sm font-medium">{r.author} · {r.rating}/5</p>
                <p className="mt-2 text-sm text-shifaa-muted">{r.comment}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => moderate(r.id, "approve")} className="btn-primary py-2 text-sm">
                    Approuver
                  </button>
                  <button type="button" onClick={() => moderate(r.id, "reject")} className="btn-secondary py-2 text-sm">
                    Rejeter
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
