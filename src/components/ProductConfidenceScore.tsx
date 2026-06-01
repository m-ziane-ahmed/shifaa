"use client";

import { Star, RotateCcw, Users, TrendingUp } from "lucide-react";

type Props = {
  score: number;          // 0-100
  reviewCount: number;
  reorderRate: number;    // 0-100
  satisfactionRate: number; // 0-100
  popularityScore: number;  // 0-100
};

export function ProductConfidenceScore({
  score,
  reviewCount,
  reorderRate,
  satisfactionRate,
  popularityScore,
}: Props) {
  const level =
    score >= 80 ? { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" } :
    score >= 60 ? { label: "Très bien", color: "text-shifaa-green", bg: "bg-shifaa-green/5", ring: "ring-shifaa-green/20" } :
    score >= 40 ? { label: "Bien", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" } :
                  { label: "Nouveau", color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" };

  return (
    <div className={`rounded-2xl border ${level.bg} p-4 ring-1 ${level.ring}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-shifaa-muted">
          Score de confiance
        </p>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${level.color} ${level.bg}`}>
          <span className="text-base">{score >= 80 ? "🏆" : score >= 60 ? "✅" : score >= 40 ? "👍" : "🆕"}</span>
          {level.label}
        </span>
      </div>

      {/* Barre de score principale */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-2xl font-bold text-shifaa-ink">{score}</span>
          <span className="text-xs text-shifaa-muted">/100</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white shadow-inner overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-shifaa-green to-emerald-400 transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
          <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] text-shifaa-muted">Satisfaction</p>
            <p className="text-xs font-bold text-shifaa-ink">{satisfactionRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
          <RotateCcw className="h-3.5 w-3.5 text-shifaa-green shrink-0" />
          <div>
            <p className="text-[10px] text-shifaa-muted">Réachat</p>
            <p className="text-xs font-bold text-shifaa-ink">{reorderRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
          <Users className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] text-shifaa-muted">Avis clients</p>
            <p className="text-xs font-bold text-shifaa-ink">{reviewCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] text-shifaa-muted">Popularité</p>
            <p className="text-xs font-bold text-shifaa-ink">{popularityScore}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
