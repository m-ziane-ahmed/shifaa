"use client";

import Link from "next/link";
import { CheckCircle, Lock } from "lucide-react";

const LEVELS = [
  { slug: "decouverte", label: "Découverte", icon: "🌱", minPts: 0,    color: "border-gray-300 bg-gray-50",    textColor: "text-gray-600",    perks: ["Accès catalogue complet", "Support standard"] },
  { slug: "silver",     label: "Silver",     icon: "🥈", minPts: 200,  color: "border-gray-400 bg-gray-100",   textColor: "text-gray-700",    perks: ["Livraison prioritaire", "Ventes privées", "5% de réduction"] },
  { slug: "gold",       label: "Gold",       icon: "🥇", minPts: 500,  color: "border-amber-300 bg-amber-50",  textColor: "text-amber-700",   perks: ["Livraison offerte dès 2000 DZD", "Accès anticipé", "10% de réduction"] },
  { slug: "platinum",   label: "Platinum",   icon: "💎", minPts: 1000, color: "border-violet-300 bg-violet-50", textColor: "text-violet-700",  perks: ["Livraison offerte dès 1500 DZD", "15% de réduction", "Conseiller dédié"] },
  { slug: "premium",    label: "Premium",    icon: "👑", minPts: 2000, color: "border-red-300 bg-red-50",       textColor: "text-red-700",     perks: ["Livraison offerte systématique", "20% de réduction", "Accès bêta"] },
];

const MISSIONS = [
  { icon: "🛒", label: "Première commande", pts: 100, done: false },
  { icon: "👤", label: "Profil complété",   pts: 50,  done: false },
  { icon: "⭐", label: "Premier avis",      pts: 75,  done: false },
  { icon: "🌸", label: "Routine créée",     pts: 60,  done: false },
  { icon: "🤝", label: "Parrainage ami",    pts: 150, done: false },
  { icon: "🗺️", label: "3 catégories",     pts: 80,  done: false },
  { icon: "❤️", label: "10 favoris",       pts: 40,  done: false },
  { icon: "🏆", label: "5ème commande",     pts: 200, done: false },
];

export function LoyaltyDashboard({ points = 0 }: { points: number }) {
  const currentLevel = [...LEVELS].reverse().find((l) => points >= l.minPts) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.minPts > points);
  const progress = nextLevel
    ? Math.round(((points - currentLevel.minPts) / (nextLevel.minPts - currentLevel.minPts)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Niveau actuel */}
      <div className={`card-surface p-6 border-2 ${currentLevel.color}`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{currentLevel.icon}</span>
          <div className="flex-1">
            <p className="text-xs text-shifaa-muted">Votre niveau</p>
            <p className={`text-xl font-bold ${currentLevel.textColor}`}>{currentLevel.label}</p>
            <p className="text-sm text-shifaa-muted">{points} points fidélité</p>
          </div>
          {nextLevel && (
            <div className="text-right">
              <p className="text-xs text-shifaa-muted">Prochain niveau</p>
              <p className="text-sm font-medium text-shifaa-ink">{nextLevel.icon} {nextLevel.label}</p>
              <p className="text-xs text-shifaa-green">+{nextLevel.minPts - points} pts</p>
            </div>
          )}
        </div>
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-shifaa-muted mb-1">
              <span>{currentLevel.minPts} pts</span>
              <span>{nextLevel.minPts} pts</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/50 overflow-hidden border border-white/30">
              <div className={`h-full rounded-full transition-all bg-current ${currentLevel.textColor}`}
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Avantages actuels */}
      <div className="card-surface p-5">
        <h3 className="font-semibold text-shifaa-ink mb-3">Vos avantages {currentLevel.label}</h3>
        <ul className="space-y-2">
          {currentLevel.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm text-shifaa-muted">
              <CheckCircle className="h-4 w-4 text-shifaa-green shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* Niveaux */}
      <div className="card-surface p-5">
        <h3 className="font-semibold text-shifaa-ink mb-4">Tous les niveaux</h3>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const unlocked = points >= level.minPts;
            const isCurrent = level.slug === currentLevel.slug;
            return (
              <div key={level.slug}
                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                  isCurrent ? `${level.color} border-2` : unlocked ? "border-gray-100 bg-gray-50" : "border-dashed border-gray-200 opacity-60"
                }`}>
                <span className="text-xl">{level.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isCurrent ? level.textColor : "text-shifaa-ink"}`}>
                    {level.label} {isCurrent && "← Votre niveau"}
                  </p>
                  <p className="text-xs text-shifaa-muted">{level.minPts} points</p>
                </div>
                {unlocked ? (
                  <CheckCircle className="h-5 w-5 text-shifaa-green shrink-0" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missions */}
      <div className="card-surface p-5">
        <h3 className="font-semibold text-shifaa-ink mb-4">Missions — gagnez des points</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {MISSIONS.map((m) => (
            <div key={m.label}
              className={`flex items-center gap-3 rounded-xl border p-3 ${m.done ? "border-green-200 bg-green-50" : "border-shifaa-border bg-white"}`}>
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-shifaa-ink truncate">{m.label}</p>
                <p className="text-xs text-shifaa-green">+{m.pts} pts</p>
              </div>
              {m.done && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
            </div>
          ))}
        </div>
        <Link href="/compte/preferences" className="mt-4 block text-center text-xs text-shifaa-green hover:underline">
          Compléter votre profil pour débloquer des missions →
        </Link>
      </div>
    </div>
  );
}
