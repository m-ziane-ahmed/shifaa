"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  gradient: string;
  textDark: boolean; // true = texte sombre (pour dégradés clairs), false = texte blanc
};

const BANNERS: Banner[] = [
  {
    id: 1,
    title: "Votre parapharmacie de confiance",
    subtitle: "Plus de 1\u202f500 références · Livraison nationale · Prix en DZD",
    cta: { label: "Découvrir la boutique", href: "/boutique" },
    gradient: "from-shifaa-dark via-shifaa-green/80 to-shifaa-lime/60",
    textDark: false,
  },
  {
    id: 2,
    title: "Promotions du moment",
    subtitle: "Jusqu\u2019à -15\u202f% sur une sélection de soins et hygiène",
    cta: { label: "Voir les offres", href: "/promotions" },
    gradient: "from-shifaa-green to-shifaa-lime/70",
    textDark: true, // dégradé clair → texte sombre
  },
  {
    id: 3,
    title: "Conseil pharmaceutique",
    subtitle: "Docteur S.Benali — expertise au service de votre bien-être",
    cta: { label: "En savoir plus", href: "/a-propos#equipe" },
    gradient: "from-shifaa-dark to-shifaa-green",
    textDark: false,
  },
  {
    id: 4,
    title: "Nouveautés",
    subtitle: "Les derniers produits ajoutés au catalogue",
    cta: { label: "Explorer", href: "/nouveautes" },
    gradient: "from-shifaa-lime/80 to-shifaa-green/90",
    textDark: true, // dégradé clair → texte sombre
  },
];

export function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((next: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setIndex(next);
      setTransitioning(false);
    }, 150);
  }, []);

  const next = useCallback(() => goTo((index + 1) % BANNERS.length), [index, goTo]);
  const prev = useCallback(() => goTo((index - 1 + BANNERS.length) % BANNERS.length), [index, goTo]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const banner = BANNERS[index];
  // textDark disponible pour extensions futures (overlay adaptatif)
  void banner.textDark;

  return (
    <section className="relative overflow-hidden" aria-label="Bannières promotionnelles">
      <div
        className={`relative bg-gradient-to-r ${banner.gradient} transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        {/* Overlay sombre semi-transparent sous le texte pour garantir lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none" />

        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-xl">
            {/* Compteur — toujours lisible grâce à l'overlay */}
            <p className="text-sm font-medium uppercase tracking-widest text-white/80">
              {index + 1}/{BANNERS.length}
            </p>

            {/* Titre — fond semi-transparent pour garantir lisibilité absolue */}
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white drop-shadow-md md:text-4xl">
              {banner.title}
            </h2>

            {/* Sous-titre */}
            <p className="mt-4 text-lg text-white/90 drop-shadow">
              {banner.subtitle}
            </p>

            {/* CTA — toujours blanc sur fond foncé */}
            <Link
              href={banner.cta.href}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-shifaa-ink shadow-md hover:bg-shifaa-lime transition-colors"
            >
              {banner.cta.label} →
            </Link>
          </div>

          {/* Flèches navigation */}
          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="rounded-full bg-white/20 p-3 text-white hover:bg-white/40 backdrop-blur-sm transition-colors"
              aria-label="Bannière précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-white/20 p-3 text-white hover:bg-white/40 backdrop-blur-sm transition-colors"
              aria-label="Bannière suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Indicateurs de position */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Bannière ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
