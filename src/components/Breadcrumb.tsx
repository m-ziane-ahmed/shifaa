"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const all = [{ label: "Accueil", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${process.env.NEXT_PUBLIC_APP_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Fil d'Ariane"
        className="flex items-center gap-1 text-xs text-shifaa-muted py-3 px-4 md:px-0 flex-wrap"
      >
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i === 0 && <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-shifaa-green hover:underline transition-colors truncate max-w-[120px] md:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-shifaa-ink truncate max-w-[160px]" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3 w-3 text-shifaa-muted/50 shrink-0" aria-hidden />
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
