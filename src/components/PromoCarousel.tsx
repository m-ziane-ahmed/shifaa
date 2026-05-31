"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    id: 1,
    title: "Votre parapharmacie de confiance",
    subtitle: "Plus de 1 500 références · Livraison nationale · Prix en DZD",
    cta: { label: "Découvrir la boutique", href: "/boutique" },
    gradient: "from-shifaa-dark via-shifaa-green/80 to-shifaa-lime/60",
  },
  {
    id: 2,
    title: "Promotions du moment",
    subtitle: "Jusqu'à -15 % sur une sélection de soins et hygiène",
    cta: { label: "Voir les offres", href: "/promotions" },
    gradient: "from-shifaa-green to-shifaa-lime/70",
  },
  {
    id: 3,
    title: "Conseil pharmaceutique",
    subtitle: "Docteur S.Benali — expertise au service de votre bien-être",
    cta: { label: "En savoir plus", href: "/a-propos#equipe" },
    gradient: "from-shifaa-dark to-shifaa-green",
  },
  {
    id: 4,
    title: "Nouveautés",
    subtitle: "Les derniers produits ajoutés au catalogue",
    cta: { label: "Explorer", href: "/nouveautes" },
    gradient: "from-shifaa-lime/80 to-shifaa-green/90",
  },
];

export function PromoCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % BANNERS.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + BANNERS.length) % BANNERS.length),
    []
  );

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const banner = BANNERS[index];

  return (
    <section className="relative overflow-hidden" aria-label="Bannières promotionnelles">
      <div className={`relative bg-gradient-to-r ${banner.gradient} text-dark transition-all duration-400`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-shifaa-dark">
              {index + 1}/{BANNERS.length}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
              {banner.title}
            </h2>
            <p className="mt-4 text-lg text-white/90">{banner.subtitle}</p>
            <Link href={banner.cta.href} className="btn-primary mt-8 inline-flex bg-white text-shifaa-dark hover:bg-shifaa-cream">
              {banner.cta.label}
            </Link>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="rounded-full bg-gray/20 p-3 hover:bg-gray/30"
              aria-label="Bannière précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-gray/20 p-3 hover:bg-gray/30"
              aria-label="Bannière suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-gray" : "w-2 bg-gray/30"}`}
              aria-label={`Bannière ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
