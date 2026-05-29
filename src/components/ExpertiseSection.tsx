import Link from "next/link";
import { ArrowRight, Award, HeartHandshake, Stethoscope } from "lucide-react";
import { PHARMACY_EXPERT } from "@/data/team";

type ExpertiseSectionProps = {
  variant?: "home" | "about";
};

export function ExpertiseSection({ variant = "home" }: ExpertiseSectionProps) {
  const isHome = variant === "home";

  return (
    <section
      className={
        isHome
          ? "bg-shifaa-dark text-white"
          : "mt-10"
      }
      aria-labelledby="expertise-heading"
    >
      <div className={isHome ? "mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20" : ""}>
        <div
          className={
            isHome
              ? "grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
              : "card-surface overflow-hidden border-shifaa-dark/10"
          }
        >
          <div
            className={
              isHome
                ? "relative flex justify-center lg:justify-start"
                : "bg-gradient-to-br from-shifaa-lime/25 to-shifaa-cream p-8 md:p-10 flex justify-center"
            }
          >
            <div className="relative">
              <div
                className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-shifaa-lime/40 to-shifaa-green/30 ${
                  isHome ? "h-56 w-56 md:h-72 md:w-72" : "h-48 w-48"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full bg-shifaa-dark font-display font-semibold text-shifaa-lime ${
                    isHome ? "h-32 w-32 text-4xl md:h-40 md:w-40 md:text-5xl" : "h-28 w-28 text-3xl"
                  }`}
                  aria-hidden
                >
                  SB
                </div>
              </div>
              <div
                className={`absolute -bottom-3 -right-3 flex items-center gap-2 rounded-full px-4 py-2 shadow-lift ${
                  isHome ? "bg-shifaa-lime text-shifaa-dark" : "bg-shifaa-dark text-white"
                }`}
              >
                <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {PHARMACY_EXPERT.title}
                </span>
              </div>
            </div>
          </div>

          <div className={isHome ? "" : "p-8 md:p-10"}>
            <p
              className={`text-sm font-medium uppercase tracking-widest ${
                isHome ? "text-shifaa-lime" : "text-shifaa-green"
              }`}
            >
              Expertise pharmaceutique
            </p>
            <h2
              id="expertise-heading"
              className={`mt-3 font-display font-semibold leading-tight ${
                isHome ? "text-3xl md:text-4xl text-white" : "text-2xl md:text-3xl text-shifaa-ink"
              }`}
            >
              {PHARMACY_EXPERT.name}
            </h2>
            <p
              className={`mt-2 text-lg font-medium ${
                isHome ? "text-white/90" : "text-shifaa-green"
              }`}
            >
              {PHARMACY_EXPERT.title} · {PHARMACY_EXPERT.role}
            </p>
            <p
              className={`mt-5 leading-relaxed ${
                isHome ? "text-white/80" : "prose-shifaa"
              }`}
            >
              {PHARMACY_EXPERT.credentials}
            </p>
            <p
              className={`mt-4 leading-relaxed ${
                isHome ? "text-white/80" : "prose-shifaa"
              }`}
            >
              {PHARMACY_EXPERT.mission}
            </p>

            {!isHome && (
              <ul className="mt-6 space-y-3">
                {PHARMACY_EXPERT.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-shifaa-muted">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-shifaa-green" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {isHome && (
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/90">
                  <HeartHandshake className="h-5 w-5 text-shifaa-lime shrink-0" aria-hidden />
                  Conseil santé de proximité
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/90">
                  <Award className="h-5 w-5 text-shifaa-lime shrink-0" aria-hidden />
                  Filière pharmaceutique
                </div>
              </div>
            )}

            {isHome && (
              <Link
                href="/a-propos#equipe"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-shifaa-lime hover:underline"
              >
                Découvrir notre équipe
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}

            <p
              className={`mt-6 text-xs leading-relaxed ${
                isHome ? "text-white/50" : "text-shifaa-muted"
              }`}
            >
              Shifaa reste une boutique parapharmaceutique en ligne : aucun médicament sur ordonnance
              n&apos;est délivré. Les conseils portent sur le choix de produits autorisés dans notre
              périmètre de vente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
