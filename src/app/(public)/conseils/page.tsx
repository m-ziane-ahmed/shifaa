import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ARTICLES } from "@/data/articles";

export const metadata = {
  title: "Conseils",
  description: "Articles, guides d'achat et FAQ bien-être — formulations prudentes et non trompeuses.",
};

const THEMES = ["Tous", "Peau", "Hygiène", "Bébé", "Saisonnalité", "Bien-être"];
const PAGE_SIZE = 6;

export default async function ConseilsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentType = params.type ?? "Tous";
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);

  // Filtrer par type
  const filtered = currentType === "Tous"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === currentType);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const typeLabel = currentType !== "Tous" ? currentType : null;

  return (
    <>
      {/* Header */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <Breadcrumb items={[
            ...(typeLabel
              ? [{ label: "Conseils", href: "/conseils" }, { label: typeLabel }]
              : [{ label: "Conseils" }]
            )
          ]} />
          <div className="mt-2 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-shifaa-green" />
            <h1 className="font-display text-3xl font-semibold text-shifaa-ink">
              {typeLabel ? `Conseils — ${typeLabel}` : "Conseils & contenus"}
            </h1>
          </div>
          <p className="mt-2 text-shifaa-muted">
            Guides d&apos;achat et articles par thématique · Sans promesse médicale
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        {/* Bandeau filtres par type */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max md:flex-wrap md:min-w-0">
            {THEMES.map((theme) => {
              const isActive = currentType === theme;
              const count = theme === "Tous"
                ? ARTICLES.length
                : ARTICLES.filter((a) => a.category === theme).length;
              if (count === 0 && theme !== "Tous") return null;
              return (
                <Link
                  key={theme}
                  href={theme === "Tous" ? "/conseils?page=1" : `/conseils?type=${encodeURIComponent(theme)}&page=1`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-shifaa-green text-white border-transparent shadow-md"
                      : "border-shifaa-border bg-white text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
                  }`}
                >
                  {theme}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-white/20 text-white" : "bg-shifaa-lime/30 text-shifaa-ink"
                  }`}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-shifaa-muted">
            <span className="font-semibold text-shifaa-ink">{total}</span> article{total > 1 ? "s" : ""}
            {typeLabel && <span> dans <span className="text-shifaa-green">{typeLabel}</span></span>}
            {totalPages > 1 && <span> · page {currentPage}/{totalPages}</span>}
          </p>
        </div>

        {/* Grille articles */}
        {paginated.length === 0 ? (
          <div className="rounded-2xl border border-shifaa-border bg-white p-12 text-center">
            <p className="text-3xl mb-3">📚</p>
            <p className="font-medium text-shifaa-ink">Aucun article dans cette catégorie</p>
            <Link href="/conseils" className="mt-4 inline-block text-sm font-medium text-shifaa-green hover:underline">
              Voir tous les conseils →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {paginated.map((a) => (
              <article key={a.slug} className="card-surface group flex flex-col overflow-hidden transition hover:shadow-lift">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-shifaa-lime/30 px-3 py-1 text-xs font-medium text-shifaa-ink">
                      {a.category}
                    </span>
                    <span className="text-xs text-shifaa-muted">{a.readTime}</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-shifaa-ink group-hover:text-shifaa-green transition-colors">
                    <Link href={`/conseils/${a.slug}`}>
                      {a.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-shifaa-muted flex-1">{a.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-shifaa-muted">
                      {new Date(a.date).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <Link
                      href={`/conseils/${a.slug}`}
                      className="text-sm font-medium text-shifaa-green hover:underline"
                    >
                      Lire →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/conseils?type=${currentType}&page=${currentPage - 1}`}
                className="btn-secondary py-2 text-sm"
              >
                Précédent
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/conseils?type=${currentType}&page=${p}`}
                className={
                  p === currentPage
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-shifaa-green text-sm font-medium text-white"
                    : "flex h-10 w-10 items-center justify-center rounded-full border border-shifaa-border text-sm hover:border-shifaa-green"
                }
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/conseils?type=${currentType}&page=${currentPage + 1}`}
                className="btn-secondary py-2 text-sm"
              >
                Suivant
              </Link>
            )}
          </nav>
        )}

        {/* FAQ */}
        <section className="mt-16 card-surface p-8">
          <h2 className="font-display text-2xl font-semibold">FAQ santé &amp; bien-être</h2>
          <p className="mt-2 text-sm text-shifaa-muted">
            Réponses générales · Pour tout problème de santé, consultez un professionnel.
          </p>
          <dl className="mt-6 space-y-6">
            {[
              {
                q: "Puis-je remplacer un traitement par un complément ?",
                a: "Non. Les compléments alimentaires ne se substituent pas à un traitement médical ni à une alimentation équilibrée.",
              },
              {
                q: "Comment choisir un produit pour bébé ?",
                a: "Privilégiez des formules adaptées à l'âge, sans parfum si la peau est sensible, et lisez toujours les précautions.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-shifaa-border pb-6 last:border-0 last:pb-0">
                <dt className="font-medium text-shifaa-ink">{item.q}</dt>
                <dd className="mt-1 text-sm text-shifaa-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
          <Link href="/service-client" className="mt-6 inline-block text-sm font-medium text-shifaa-green hover:underline">
            Plus de questions → Service client
          </Link>
        </section>
      </div>
    </>
  );
}
