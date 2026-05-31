"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

// ── Questionnaire peau ───────────────────────────────────
const SKIN_QUIZ = [
  {
    id: "skin_type",
    question: "Comment décrivez-vous votre peau en général ?",
    icon: "🌸",
    options: [
      { value: "seche", label: "Sèche", sub: "Tiraillements, manque de confort" },
      { value: "grasse", label: "Grasse", sub: "Brillances, pores dilatés" },
      { value: "mixte", label: "Mixte", sub: "Zone T grasse, joues normales" },
      { value: "normale", label: "Normale", sub: "Confortable, peu de problèmes" },
      { value: "sensible", label: "Sensible", sub: "Rougeurs, réactions fréquentes" },
    ],
  },
  {
    id: "concern",
    question: "Quelle est votre principale préoccupation ?",
    icon: "🔍",
    options: [
      { value: "hydratation", label: "Hydratation", sub: "Peau qui manque de souplesse" },
      { value: "acne", label: "Acné & imperfections", sub: "Boutons, points noirs" },
      { value: "antiage", label: "Anti-âge", sub: "Rides, perte de fermeté" },
      { value: "eclat", label: "Éclat & teint unifié", sub: "Teint terne, taches" },
      { value: "protection", label: "Protection", sub: "UV, pollution, agression" },
    ],
  },
  {
    id: "age",
    question: "Dans quelle tranche d'âge êtes-vous ?",
    icon: "📅",
    options: [
      { value: "under25", label: "Moins de 25 ans", sub: "" },
      { value: "25-35", label: "25–35 ans", sub: "" },
      { value: "35-45", label: "35–45 ans", sub: "" },
      { value: "over45", label: "Plus de 45 ans", sub: "" },
    ],
  },
  {
    id: "routine",
    question: "Quelle est votre routine actuelle ?",
    icon: "💆",
    options: [
      { value: "none", label: "Aucune routine", sub: "Je démarre" },
      { value: "basic", label: "Routine basique", sub: "Nettoyant + hydratant" },
      { value: "advanced", label: "Routine avancée", sub: "Sérum + soin ciblé + SPF" },
    ],
  },
];

// ── Mapping profil → recommandations ─────────────────────
function getProfile(answers: Record<string, string>) {
  const { skin_type, concern, age, routine } = answers;
  const profileParts = [];
  const hrefs: string[] = [];

  if (skin_type === "seche") { profileParts.push("Peau sèche"); hrefs.push("/boutique?categorie=visage-peau&peau=sèche"); }
  if (skin_type === "grasse" || concern === "acne") { profileParts.push("Peau à tendance acnéique"); hrefs.push("/boutique?categorie=visage-peau&besoin=purifiant"); }
  if (skin_type === "sensible") { profileParts.push("Peau sensible"); hrefs.push("/boutique?categorie=visage-peau&isSansParfum=1"); }
  if (concern === "antiage" || age === "over45") { profileParts.push("Besoins anti-âge"); hrefs.push("/boutique?categorie=visage-peau&besoin=anti-âge"); }
  if (concern === "hydratation") { profileParts.push("Hydratation prioritaire"); hrefs.push("/boutique?categorie=visage-peau&besoin=hydratation"); }
  if (concern === "protection") { profileParts.push("Protection solaire essentielle"); hrefs.push("/boutique?categorie=visage-peau&besoin=protection+solaire"); }

  const routineSteps = [];
  if (routine === "none" || routine === "basic") {
    routineSteps.push({ step: 1, label: "Nettoyant doux", freq: "Matin & soir" });
    routineSteps.push({ step: 2, label: "Hydratant adapté", freq: "Matin & soir" });
    if (concern === "protection" || age !== "under25") {
      routineSteps.push({ step: 3, label: "Crème SPF 50", freq: "Matin uniquement" });
    }
  } else {
    routineSteps.push({ step: 1, label: "Nettoyant doux", freq: "Matin & soir" });
    routineSteps.push({ step: 2, label: "Tonique équilibrant", freq: "Matin & soir" });
    routineSteps.push({ step: 3, label: "Sérum ciblé", freq: "Matin & soir" });
    routineSteps.push({ step: 4, label: "Hydratant", freq: "Matin & soir" });
    routineSteps.push({ step: 5, label: "SPF 50+", freq: "Matin uniquement" });
  }

  const searchUrl = hrefs[0] ?? "/boutique?categorie=visage-peau";

  return {
    label: profileParts.join(" · ") || "Peau normale",
    routine: routineSteps,
    searchUrl,
    badge: concern === "acne" ? "🫧 Anti-imperfections" :
      concern === "antiage" ? "⏳ Anti-âge" :
      concern === "hydratation" ? "💧 Hydratation" :
      skin_type === "sensible" ? "🌿 Peau sensible" : "✨ Soins adaptés",
  };
}

type DiagType = "peau" | "cheveux";

export default function DiagnosticPage() {
  const [diagType, setDiagType] = useState<DiagType | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof getProfile> | null>(null);

  const quiz = SKIN_QUIZ; // Extensible pour cheveux
  const currentQ = quiz[step];

  function select(value: string) {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    if (step < quiz.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getProfile(newAnswers));
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setDiagType(null);
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Diagnostic personnalisé" }]} />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-shifaa-lime/30 text-3xl mb-4">
            🔬
          </div>
          <h1 className="font-display text-3xl font-semibold text-shifaa-ink">
            Diagnostic personnalisé
          </h1>
          <p className="mt-2 text-shifaa-muted max-w-sm mx-auto">
            Répondez à quelques questions et obtenez des recommandations de produits adaptées à votre profil.
          </p>
        </div>

        {/* Choix du type de diagnostic */}
        {!diagType && !result && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { type: "peau" as const, icon: "🌸", label: "Diagnostic peau", sub: "Type de peau, préoccupations, routine" },
              { type: "cheveux" as const, icon: "💇", label: "Diagnostic cheveux", sub: "Type de cheveux, besoins, objectifs" },
            ].map((d) => (
              <button key={d.type} type="button"
                onClick={() => setDiagType(d.type)}
                className="card-surface flex flex-col items-center gap-3 p-8 hover:border-shifaa-green hover:shadow-lift transition-all group">
                <span className="text-4xl">{d.icon}</span>
                <div className="text-center">
                  <p className="font-semibold text-shifaa-ink group-hover:text-shifaa-green">{d.label}</p>
                  <p className="text-sm text-shifaa-muted mt-1">{d.sub}</p>
                </div>
                <span className="text-xs text-shifaa-green">Commencer →</span>
              </button>
            ))}
          </div>
        )}

        {/* Quiz */}
        {diagType && !result && currentQ && (
          <div className="card-surface p-8">
            {/* Progression */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-shifaa-muted mb-2">
                <span>Question {step + 1}/{quiz.length}</span>
                <span>{Math.round(((step + 1) / quiz.length) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-shifaa-cream overflow-hidden">
                <div className="h-full bg-shifaa-green rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / quiz.length) * 100}%` }} />
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-3xl">{currentQ.icon}</span>
              <h2 className="mt-3 text-xl font-semibold text-shifaa-ink">{currentQ.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => select(opt.value)}
                  className="flex w-full items-center gap-3 rounded-xl border border-shifaa-border bg-white p-4 text-left hover:border-shifaa-green hover:bg-shifaa-lime/10 hover:shadow-sm transition-all group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-shifaa-border group-hover:border-shifaa-green group-hover:bg-shifaa-green group-hover:text-white transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-shifaa-ink">{opt.label}</p>
                    {opt.sub && <p className="text-xs text-shifaa-muted">{opt.sub}</p>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => step > 0 ? setStep(step - 1) : reset()}
                className="text-xs text-shifaa-muted hover:text-shifaa-green transition-colors">
                ← Retour
              </button>
              <button onClick={reset} className="text-xs text-shifaa-muted hover:text-red-500 transition-colors">
                Recommencer
              </button>
            </div>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className="space-y-6">
            {/* Profil */}
            <div className="card-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-shifaa-lime/30 text-2xl">
                  🎯
                </div>
                <div>
                  <p className="text-xs text-shifaa-muted">Votre profil</p>
                  <h2 className="font-semibold text-shifaa-ink">{result.label}</h2>
                </div>
                <span className="ml-auto rounded-full bg-shifaa-lime/20 border border-shifaa-lime/40 px-3 py-1 text-xs font-medium text-shifaa-ink">
                  {result.badge}
                </span>
              </div>
              <p className="text-sm text-shifaa-muted">
                Voici votre routine et sélection de produits adaptées à votre profil unique.
              </p>
            </div>

            {/* Routine suggérée */}
            <div className="card-surface p-6">
              <h3 className="font-semibold text-shifaa-ink flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-shifaa-green" />
                Votre routine personnalisée
              </h3>
              <div className="space-y-3">
                {result.routine.map(({ step: s, label, freq }) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-shifaa-lime/30 text-xs font-bold text-shifaa-green">
                      {s}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-shifaa-ink">{label}</p>
                    </div>
                    <span className="text-xs text-shifaa-muted">{freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA produits */}
            <div className="card-surface p-6 text-center">
              <CheckCircle className="h-8 w-8 text-shifaa-green mx-auto mb-3" />
              <h3 className="font-semibold text-shifaa-ink mb-2">
                Découvrez les produits recommandés
              </h3>
              <p className="text-sm text-shifaa-muted mb-4">
                Sélection filtrée selon votre profil exact
              </p>
              <Link href={result.searchUrl}
                className="btn-primary inline-flex items-center gap-2">
                Voir mes recommandations →
              </Link>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="button" onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-shifaa-border py-3 text-sm text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                <RotateCcw className="h-4 w-4" />
                Nouveau diagnostic
              </button>
              <Link href="/compte/routines"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-shifaa-lime/20 border border-shifaa-lime/40 py-3 text-sm font-medium text-shifaa-ink hover:bg-shifaa-lime/30 transition-colors">
                <Sparkles className="h-4 w-4 text-shifaa-green" />
                Sauvegarder ma routine
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
