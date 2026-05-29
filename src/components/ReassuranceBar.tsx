import { CreditCard, Headphones, MapPin, RotateCcw, Truck } from "lucide-react";

const items = [
  { icon: CreditCard, label: "Paiement sécurisé", sub: "CIB, Edahabia, à la livraison" },
  { icon: Truck, label: "Livraison nationale", sub: "Domicile ou point relais" },
  { icon: RotateCcw, label: "Retours simplifiés", sub: "Sous conditions légales" },
  { icon: Headphones, label: "Service client", sub: "Du sam. au jeu." },
  { icon: MapPin, label: "Couverture wilayas", sub: "Délais affichés par zone" },
];

export function ReassuranceBar() {
  return (
    <section className="border-y border-shifaa-border bg-white py-8" aria-label="Réassurance">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-5 md:px-6">
        {items.map(({ icon: Icon, label, sub }) => (
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
    </section>
  );
}
