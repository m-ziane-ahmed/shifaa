"use client";

import { useState } from "react";
import { Star, CheckCircle, HelpCircle, MessageCircle, FlaskConical, BookOpen, AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { id: "description", label: "Description", icon: BookOpen },
  { id: "composition", label: "Composition", icon: FlaskConical },
  { id: "utilisation", label: "Utilisation", icon: CheckCircle },
  { id: "precautions", label: "Précautions", icon: AlertTriangle },
  { id: "avis", label: "Avis", icon: Star },
  { id: "qa", label: "Q&R", icon: HelpCircle },
];

type QA = { id: string; question: string; answer: string; asked_by?: string; answered_at: string };
type Review = { id: string; author: string; rating: number; comment: string; created_at: string };

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState("description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qas, setQas] = useState<QA[]>([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [qaLoaded, setQaLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  function handleTabClick(id: string) {
    setActive(id);
    if (id === "avis" && !reviewsLoaded) {
      fetch(`/api/reviews?productId=${product.id}`)
        .then((r) => r.json())
        .then((d) => { setReviews(d.reviews ?? []); setReviewsLoaded(true); });
    }
    if (id === "qa" && !qaLoaded) {
      fetch(`/api/product-qa?productId=${product.id}`)
        .then((r) => r.json())
        .then((d) => { setQas(d.qas ?? []); setQaLoaded(true); });
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    setMessage(res.ok ? "Avis soumis — en attente de modération." : data.error ?? "Erreur");
    if (res.ok) setComment("");
  }

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/product-qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, question }),
    });
    setSubmitting(false);
    setMessage(res.ok ? "Question envoyée — réponse sous 24h." : "Erreur");
    if (res.ok) setQuestion("");
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;
  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    n, count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="mt-12">
      {/* Onglets */}
      <div className="border-b border-shifaa-border overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabClick(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${active === id
                  ? "border-shifaa-green text-shifaa-green"
                  : "border-transparent text-shifaa-muted hover:text-shifaa-ink hover:border-shifaa-border"
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "avis" && (
                <span className="rounded-full bg-shifaa-lime/30 px-1.5 py-0.5 text-[10px] font-bold text-shifaa-ink">
                  {product.reviewCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="py-8">

        {/* Description */}
        {active === "description" && (
          <div className="space-y-6">
            <p className="text-shifaa-muted leading-relaxed">{product.description}</p>
            {product.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold text-shifaa-ink mb-3">Bénéfices clés</h3>
                <ul className="space-y-2">
                  {product.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-shifaa-muted">
                      <CheckCircle className="h-4 w-4 text-shifaa-green shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-shifaa-muted border-l-2 border-shifaa-lime pl-3">
                  Ces informations sont indicatives et ne constituent pas une promesse médicale.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Composition */}
        {active === "composition" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-shifaa-ink mb-2">Liste INCI / Ingrédients</h3>
              <div className="rounded-xl bg-gray-50 border border-shifaa-border p-4">
                <p className="text-sm font-mono text-shifaa-muted leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            </div>
            {product.activeIngredients && product.activeIngredients.length > 0 && (
              <div>
                <h3 className="font-semibold text-shifaa-ink mb-2">Principes actifs</h3>
                <div className="flex flex-wrap gap-2">
                  {product.activeIngredients.map((ing) => (
                    <span key={ing} className="rounded-full bg-shifaa-lime/20 border border-shifaa-lime/40 px-3 py-1 text-sm font-medium text-shifaa-ink">
                      ✦ {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.allergens && product.allergens.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">⚠ Allergènes</p>
                <p className="text-sm text-amber-700">{product.allergens.join(", ")}</p>
              </div>
            )}
            {product.conservationConditions && (
              <div>
                <h3 className="font-semibold text-shifaa-ink mb-2">Conservation</h3>
                <p className="text-sm text-shifaa-muted">{product.conservationConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Utilisation */}
        {active === "utilisation" && (
          <div className="space-y-6">
            {[
              { label: "Quand utiliser", value: product.usageWhen ?? product.usage, icon: "🕐" },
              { label: "Fréquence", value: product.usageFrequency, icon: "🔄" },
              { label: "Quantité", value: product.usageQuantity, icon: "💧" },
              { label: "Durée d'utilisation", value: product.usageDuration, icon: "📅" },
            ].filter((s) => s.value).map(({ label, value, icon }) => (
              <div key={label} className="flex gap-4 rounded-xl border border-shifaa-border bg-white p-4">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-medium text-shifaa-ink">{label}</p>
                  <p className="mt-0.5 text-sm text-shifaa-muted">{value}</p>
                </div>
              </div>
            ))}
            {product.targetAudience && (
              <div className="flex gap-4 rounded-xl border border-shifaa-lime/40 bg-shifaa-lime/10 p-4">
                <span className="text-2xl shrink-0">👤</span>
                <div>
                  <p className="font-medium text-shifaa-ink">Public concerné</p>
                  <p className="mt-0.5 text-sm text-shifaa-muted">{product.targetAudience}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Précautions */}
        {active === "precautions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800 mb-2">⚠ Précautions d&apos;emploi</p>
              <p className="text-sm text-amber-700 leading-relaxed">{product.precautions}</p>
            </div>
            <div className="rounded-xl border border-shifaa-lime/40 bg-shifaa-lime/10 p-5">
              <p className="font-semibold text-shifaa-ink mb-2">📋 Mention réglementaire</p>
              <p className="text-sm text-shifaa-muted leading-relaxed">{product.complianceNote}</p>
            </div>
            {product.regulatoryCategory && (
              <div className="text-sm text-shifaa-muted">
                <span className="font-medium">Catégorie réglementaire :</span> {product.regulatoryCategory}
              </div>
            )}
          </div>
        )}

        {/* Avis */}
        {active === "avis" && (
          <div className="space-y-8">
            {/* Résumé */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl border border-shifaa-border bg-white">
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-shifaa-ink">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-xs text-shifaa-muted mt-1">{product.reviewCount} avis</p>
              </div>
              {reviews.length > 0 && (
                <div className="flex-1 space-y-1.5">
                  {ratingDist.map(({ n, count }) => (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-right text-shifaa-muted">{n}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                      </div>
                      <span className="w-6 text-right text-shifaa-muted">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liste avis */}
            {!reviewsLoaded ? (
              <p className="text-sm text-shifaa-muted">Chargement…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-shifaa-muted">Aucun avis publié pour le moment. Soyez le premier !</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="card-surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-shifaa-ink">{r.author}</span>
                          <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-0.5">Avis vérifié ✓</span>
                        </div>
                        <p className="text-sm text-shifaa-muted">{r.comment}</p>
                      </div>
                      <span className="text-xs text-shifaa-muted shrink-0">
                        {new Date(r.created_at).toLocaleDateString("fr-DZ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire avis */}
            <form onSubmit={submitReview} className="card-surface p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-shifaa-green" />
                Laisser un avis
              </h3>
              {!user && <p className="text-sm text-amber-600">Connectez-vous pour publier un avis vérifié.</p>}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`h-7 w-7 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 hover:text-amber-300"}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-shifaa-muted self-center">{rating} étoile{rating > 1 ? "s" : ""}</span>
              </div>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} required
                placeholder="Partagez votre expérience avec ce produit…"
                className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 resize-none" />
              {message && <p className="text-sm text-shifaa-green">{message}</p>}
              <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary">
                {submitting ? "Envoi…" : "Publier mon avis"}
              </button>
            </form>
          </div>
        )}

        {/* Q&R */}
        {active === "qa" && (
          <div className="space-y-6">
            <div className="space-y-4">
              {!qaLoaded ? (
                <p className="text-sm text-shifaa-muted">Chargement…</p>
              ) : qas.length === 0 ? (
                <p className="text-sm text-shifaa-muted">Aucune question pour le moment. Posez la première !</p>
              ) : (
                qas.map((qa) => (
                  <div key={qa.id} className="card-surface p-5">
                    <div className="flex gap-3 mb-3">
                      <HelpCircle className="h-5 w-5 text-shifaa-green shrink-0 mt-0.5" />
                      <p className="font-medium text-shifaa-ink">{qa.question}</p>
                    </div>
                    {qa.answer && (
                      <div className="flex gap-3 ml-8">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-0.5">Réponse de l&apos;équipe Shifaa</p>
                          <p className="text-sm text-shifaa-muted">{qa.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submitQuestion} className="card-surface p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-shifaa-green" />
                Poser une question
              </h3>
              <p className="text-sm text-shifaa-muted">Notre équipe vous répondra sous 24h ouvrées.</p>
              <textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} required
                placeholder="Votre question sur ce produit…"
                className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 resize-none" />
              {message && <p className="text-sm text-shifaa-green">{message}</p>}
              <button type="submit" disabled={submitting || !question.trim()} className="btn-primary">
                {submitting ? "Envoi…" : "Envoyer ma question"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
