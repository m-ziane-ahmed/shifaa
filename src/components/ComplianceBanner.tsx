import { Info } from "lucide-react";

export function ComplianceBanner({
  compact = false,
  centered = true,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-shifaa-lime/40 bg-shifaa-lime/15 px-4 py-3 text-sm text-shifaa-ink"
          : "border-y border-shifaa-lime/30 bg-shifaa-lime/20"
      }
      role="note"
    >
      <div
        className={
          compact
            ? centered
              ? "mx-auto flex max-w-4xl items-start justify-center gap-3 text-center"
              : "flex gap-3"
            : centered
              ? "mx-auto flex max-w-4xl items-start justify-center gap-3 px-4 py-3 text-center md:px-6"
              : "mx-auto flex max-w-6xl gap-3 px-4 py-3 md:px-6"
        }
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-shifaa-green" aria-hidden />
        <p className="text-sm leading-relaxed text-shifaa-ink">
          <strong>Shifaa</strong> est une boutique spécialisée en{" "}
          <strong>produits parapharmaceutiques</strong> — et non une pharmacie en ligne. Nous
          commercialisons uniquement des produits entrant dans le périmètre autorisé (hygiène, soins,
          certains compléments et accessoires).{" "}
          <strong>Aucun médicament soumis à prescription n&apos;est proposé à la vente.</strong>
        </p>
      </div>
    </div>
  );
}
