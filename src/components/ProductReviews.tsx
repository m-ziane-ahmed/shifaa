"use client";

import { FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ReviewRecord } from "@/lib/store-types";

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setMessage(data.message);
      setComment("");
    } else {
      setMessage(data.error ?? "Erreur");
    }
  }

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold">Avis clients</h2>
      <p className="mt-2 text-sm text-shifaa-muted">
        Les avis sont modérés avant publication.
      </p>

      {avg && (
        <p className="mt-4 text-2xl font-semibold">
          {avg}/5 <span className="text-sm font-normal text-shifaa-muted">({reviews.length} avis publiés)</span>
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-shifaa-muted">Chargement des avis…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-shifaa-muted">Aucun avis publié pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="card-surface p-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-shifaa-lime text-shifaa-lime" : "text-shifaa-border"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{r.author}</span>
                <span className="text-xs text-shifaa-muted">
                  {new Date(r.createdAt).toLocaleDateString("fr-DZ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-shifaa-muted">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        <h3 className="font-semibold">Laisser un avis</h3>
        {!user && (
          <p className="text-sm text-shifaa-muted">
            Connectez-vous pour publier un avis (soumis à modération).
          </p>
        )}
        <div>
          <label htmlFor="rating" className="text-sm font-medium">Note</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 rounded-xl border border-shifaa-border px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="comment" className="text-sm font-medium">Commentaire</label>
          <textarea
            id="comment"
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
          />
        </div>
        {message && <p className="text-sm text-shifaa-green">{message}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Envoi…" : "Publier mon avis"}
        </button>
      </form>
    </section>
  );
}
