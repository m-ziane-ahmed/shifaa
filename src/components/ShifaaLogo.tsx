import Link from "next/link";
import { cn } from "@/lib/utils";

type ShifaaLogoProps = {
  className?: string;
  /** Masque le texte « Shifaa » sur très petit écran (header) */
  compactOnMobile?: boolean;
};

export function ShifaaLogo({ className, compactOnMobile = false }: ShifaaLogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shifaa-green font-display text-lg font-semibold text-white">
        S
      </span>
      <div className={compactOnMobile ? "hidden sm:block" : undefined}>
        <span className="font-display text-xl font-semibold text-shifaa-ink">Shifaa</span>
        <p className="text-[10px] uppercase tracking-wider text-shifaa-muted">Parapharmacie</p>
      </div>
    </Link>
  );
}
