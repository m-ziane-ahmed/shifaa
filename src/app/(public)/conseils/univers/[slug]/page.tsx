import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { UNIVERS, UNIVERS_COLORS, getUniverBySlug } from "@/data/universes";

export async function generateStaticParams() {
  return UNIVERS.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const univers = getUniverBySlug(slug);
  if (!univers) return {};
  return {
    title: `${univers.title} — Guide d'achat Shifaa`,
    description: univers.intro.slice(0, 155),
  };
}

export default async function UniversPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const univers = getUniverBySlug(slug);
  if (!univers) notFound();

  const colors = UNIVERS_COLORS[univers.color] ?? UNIVERS_COLORS.blue;

  return (
    <>
      {/* Hero */}
      <div className={`border-b border-shifaa-border ${colors.bg}`}>
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <Breadcrumb items={[
            { label: "Conseils", href: "/conseils" },
            { label: "Guides d'achat", href: "/conseils" },
            { label: univers.title },
          ]} />
          <div className="mt-4 flex items-center gap-4">
            <span className="text-5xl">{univers.icon}</span>
            <div>
              <h1 className="font-display text-3xl font-bold text-shifaa-ink">{univers.title}</h1>
              <p className={`mt-1 text-sm font-medium ${colors.text}`}>{univers.subtitle}</p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-shifaa-muted">{univers.intro}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 space-y-10">

        {/* Ce guide est fait pour vous si... */}
        <section className="card-surface p-6">
          <h2 className="font-display text-lg font-semibold text-shifaa-ink mb-4">
            Ce guide est fait pour vous si…
          </h2>
          <ul className="space-y-2">
            {univers.whoFor.map((w) => (
              <li key={w} className="flex items-start gap-2.5 text-sm text-shifaa-ink">
                <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${colors.text}`} />
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* Routine étape par étape */}
        <section>
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-5">
            La routine recommandée
          </h2>
          <div className="space-y-4">
            {univers.steps.map((step, i) => (
              <div key={i} className={`rounded-2xl border ${colors.border} bg-white p-5`}>
                <div className="flex items-start gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
                    style={{ background: "var(--color-shifaa-green)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-shifaa-ink text-sm">{step.title}</h3>
                    <p className="mt-1 text-sm text-shifaa-muted leading-relaxed">{step.description}</p>
                    {step.tip && (
                      <div className={`mt-2 rounded-xl ${colors.bg} px-3 py-2`}>
                        <p className={`text-xs font-medium ${colors.text}`}>
                          💡 {step.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Produits recommandés */}
        <section>
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-5">
            Produits recommandés
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {univers.products.map((p) => (
              <Link key={p.slug} href={`/produit/${p.slug}`}
                className="flex items-start gap-3 rounded-2xl border border-shifaa-border bg-white p-4 hover:border-shifaa-green hover:shadow-md transition group">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${colors.bg}`}>
                  🛍️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-shifaa-ink group-hover:text-shifaa-green truncate">{p.name}</p>
                  <p className="text-xs text-shifaa-muted">{p.brand}</p>
                  <p className="mt-1 text-xs text-shifaa-muted italic">{p.role}</p>
                  {p.price && (
                    <p className="mt-1 text-xs font-semibold text-shifaa-green">{p.price}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-shifaa-muted group-hover:text-shifaa-green shrink-0 mt-1" />
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href={`/boutique?q=${encodeURIComponent(univers.title)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-shifaa-green hover:underline">
              Voir tous les produits pour {univers.title.toLowerCase()}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* À éviter */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-display text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Ce qu&apos;il vaut mieux éviter
          </h2>
          <ul className="space-y-2">
            {univers.avoid.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-sm text-red-700">
                <span className="shrink-0 mt-0.5">✗</span>
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ dédiée */}
        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-5 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-shifaa-green" />
            Questions fréquentes
          </h2>
          <dl className="space-y-5">
            {univers.faq.map((f) => (
              <div key={f.q} className="border-b border-shifaa-border pb-5 last:border-0 last:pb-0">
                <dt className="font-medium text-shifaa-ink text-sm">{f.q}</dt>
                <dd className="mt-1.5 text-sm text-shifaa-muted leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Univers connexes */}
        {univers.relatedUniverses.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold text-shifaa-ink mb-4">
              Guides connexes
            </h2>
            <div className="flex flex-wrap gap-3">
              {univers.relatedUniverses.map((s) => (
                <Link key={s} href={`/conseils/univers/${s}`}
                  className="rounded-full border border-shifaa-border bg-white px-4 py-2 text-sm hover:border-shifaa-green hover:text-shifaa-green transition">
                  {s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA diagnostic */}
        <section className="rounded-2xl bg-gradient-to-r from-shifaa-dark to-shifaa-green p-6 text-white text-center">
          <p className="text-lg font-semibold mb-2">Pas sûr(e) de ce qui vous convient ?</p>
          <p className="text-sm text-white/80 mb-4">Notre diagnostic IA gratuit vous propose une routine sur mesure en 2 minutes</p>
          <Link href="/diagnostic"
            className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-shifaa-green hover:bg-gray-50 transition">
            Faire le diagnostic gratuit →
          </Link>
        </section>

      </div>
    </>
  );
}
