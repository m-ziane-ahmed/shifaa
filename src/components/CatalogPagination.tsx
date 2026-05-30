import Link from "next/link";

const DEFAULT_PAGE_SIZE = 12;

export function getPaginationParams(
  searchParams: { [key: string]: string | string[] | undefined },
  total: number,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  return { currentPage, totalPages, start, pageSize };
}

export function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
  basePath = "/boutique"
): string {
  const next = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, val]) => {
    if (key === "page") return;
    if (typeof val === "string" && val) next.set(key, val);
  });
  if (page > 1) next.set("page", String(page));
  const q = next.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  searchParams,
  basePath = "/boutique",
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  // Générer les numéros de page à afficher (avec ellipses)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
  });

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {/* Précédent */}
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(searchParams, currentPage - 1, basePath)}
          className="btn-secondary py-2 text-sm"
          aria-label="Page précédente"
        >
          ← Précédent
        </Link>
      ) : (
        <span className="btn-secondary py-2 text-sm opacity-40 cursor-not-allowed">
          ← Précédent
        </span>
      )}

      {/* Numéros de page */}
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && (
              <span className="px-1 text-shifaa-muted select-none">…</span>
            )}
            <Link
              href={buildPageHref(searchParams, p, basePath)}
              className={
                p === currentPage
                  ? "flex h-10 w-10 items-center justify-center rounded-full bg-shifaa-green text-sm font-medium text-white shadow-sm"
                  : "flex h-10 w-10 items-center justify-center rounded-full border border-shifaa-border bg-white text-sm text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors"
              }
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Link>
          </span>
        );
      })}

      {/* Suivant */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(searchParams, currentPage + 1, basePath)}
          className="btn-secondary py-2 text-sm"
          aria-label="Page suivante"
        >
          Suivant →
        </Link>
      ) : (
        <span className="btn-secondary py-2 text-sm opacity-40 cursor-not-allowed">
          Suivant →
        </span>
      )}
    </nav>
  );
}
