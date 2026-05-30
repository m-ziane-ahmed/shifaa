import Link from "next/link";
import { CreditCard, Headphones, RotateCcw, Truck, ShieldCheck, Package, Star, Users } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Produits authentiques", sub: "Fournisseurs agréés uniquement" },
  { icon: Truck, label: "Livraison nationale", sub: "Domicile ou point relais" },
  { icon: CreditCard, label: "Paiement sécurisé", sub: "CIB · Edahabia · Livraison" },
  { icon: RotateCcw, label: "Retours simplifiés", sub: "Sous conditions légales" },
  { icon: Headphones, label: "Service client", sub: "Sam.–Jeu. 9h–18h" },
];

const STATS = [
  { icon: Package, value: "1 500+", label: "références" },
  { icon: Users, value: "5 000+", label: "clients servis" },
  { icon: Truck, value: "98%", label: "livraisons réussies" },
  { icon: Star, value: "4.8/5", label: "satisfaction" },
];

export function ReassuranceBar({ variant = "default" }: { variant?: "default" | "compact" | "stats" }) {
  if (variant === "stats") {
    return (
      <section className="border-y border-shifaa-border bg-shifaa-lime/10 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 md:px-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <Icon className="h-5 w-5 text-shifaa-green" aria-hidden />
              <p className="text-xl font-bold text-shifaa-ink">{value}</p>
              <p className="text-xs text-shifaa-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-shifaa-muted">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-shifaa-green" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className="border-y border-shifaa-border bg-white py-8" aria-label="Réassurance">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-5 md:px-6">
        {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shifaa-lime/30">
              <Icon className="h-5 w-5 text-shifaa-green" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-shifaa-ink">{label}</p>
              <p className="text-xs text-shifaa-muted">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Mini stats bar */}
      <div className="mt-6 border-t border-shifaa-border/50 pt-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 md:px-6">
          {STATS.map(({ value, label }) => (
            <p key={label} className="text-center text-sm">
              <span className="font-bold text-shifaa-ink">{value}</span>{" "}
              <span className="text-shifaa-muted">{label}</span>
            </p>
          ))}
          <Link href="/a-propos" className="text-xs text-shifaa-green hover:underline">
            En savoir plus →
          </Link>
        </div>
      </div>
    </section>
  );
}
