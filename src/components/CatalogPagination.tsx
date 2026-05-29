import Link from "next/link";

const PAGE_SIZE = 24;

export function getPaginationParams(
  searchParams: { [key: string]: string | string[] | undefined },
  total: number
) {
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  return { currentPage, totalPages, start, pageSize: PAGE_SIZE };
}

export function buildPageHref(
  baseParams: URLSearchParams,
  page: number
): string {
  const next = new URLSearchParams(baseParams.toString());
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const q = next.toString();
  return q ? `/boutique?${q}` : "/boutique";
}

export function CatalogPagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const base = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, val]) => {
    if (key === "page") return;
    if (typeof val === "string") base.set(key, val);
  });

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
  });

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={buildPageHref(base, currentPage - 1)} className="btn-secondary py-2 text-sm">
          Précédent
        </Link>
      )}
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-shifaa-muted">…</span>}
            <Link
              href={buildPageHref(base, p)}
              className={
                p === currentPage
                  ? "flex h-10 w-10 items-center justify-center rounded-full bg-shifaa-green text-sm font-medium text-white"
                  : "flex h-10 w-10 items-center justify-center rounded-full border border-shifaa-border text-sm hover:border-shifaa-green"
              }
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {currentPage < totalPages && (
        <Link href={buildPageHref(base, currentPage + 1)} className="btn-secondary py-2 text-sm">
          Suivant
        </Link>
      )}
    </nav>
  );
}
