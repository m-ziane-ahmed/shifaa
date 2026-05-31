import Link from "next/link";
import { cn } from "@/lib/utils";

type ShifaaLogoProps = {
  className?: string;
  compactOnMobile?: boolean;
  /** "dark" = texte noir (header blanc), "light" = texte blanc (footer sombre) */
  variant?: "dark" | "light";
};

export function ShifaaLogo({
  className,
  compactOnMobile = false,
  variant = "dark",
}: ShifaaLogoProps) {
  const textClass = variant === "light"
    ? "text-white"
    : "text-shifaa-ink";
  const subClass = variant === "light"
    ? "text-white/70"
    : "text-shifaa-muted";

  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shifaa-green font-display text-lg font-semibold text-white">
        S
      </span>
      <div className={compactOnMobile ? "hidden sm:block" : undefined}>
        <span className={cn("font-display text-xl font-semibold", textClass)}>Shifaa</span>
        <p className={cn("text-[10px] uppercase tracking-wider", subClass)}>Parapharmacie</p>
      </div>
    </Link>
  );
}
