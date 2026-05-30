import type { Product } from "@/lib/types";

const BADGE_DEFINITIONS = [
  { key: "isBio", label: "Bio", icon: "🌿", color: "bg-green-100 text-green-800 border-green-200" },
  { key: "isVegan", label: "Vegan", icon: "🐰", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { key: "isSansParfum", label: "Sans parfum", icon: "🚫", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "isSansParabene", label: "Sans parabène", icon: "✅", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { key: "isCertifie", label: "Certifié", icon: "🏆", color: "bg-amber-100 text-amber-800 border-amber-200" },
] as const;

const CATEGORY_BADGES: Partial<Record<string, string[]>> = {
  "visage-peau": ["Testé dermatologiquement", "Hypoallergénique"],
  "bebe-maternite": ["Testé dermatologiquement", "Hypoallergénique", "Sans alcool"],
  "complements": ["Fabriqué en UE", "Sans OGM"],
  "bio-naturel": ["Origine naturelle ≥95%", "Sans silicone"],
};

export function ProductBadges({ product }: { product: Product }) {
  const p = product as unknown as Record<string, unknown>;
  const activeBadges = BADGE_DEFINITIONS.filter((b) => p[b.key] === true);
  const catBadges = CATEGORY_BADGES[product.category] ?? [];

  if (activeBadges.length === 0 && catBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeBadges.map((b) => (
        <span
          key={b.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${b.color}`}
        >
          <span aria-hidden>{b.icon}</span>
          {b.label}
        </span>
      ))}
      {catBadges.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
        >
          ✓ {label}
        </span>
      ))}
    </div>
  );
}

export function AuthenticityBadge({ certified = true }: { certified?: boolean }) {
  if (!certified) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-shifaa-green/30 bg-shifaa-lime/10 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shifaa-green text-white text-lg">
        🛡️
      </div>
      <div>
        <p className="text-sm font-semibold text-shifaa-ink">Produit authentique garanti</p>
        <p className="text-xs text-shifaa-muted">Fournisseur agréé · Contrôle qualité validé</p>
      </div>
    </div>
  );
}
