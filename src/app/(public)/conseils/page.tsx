import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ARTICLES } from "@/data/articles";

export const metadata = {
  title: "Conseils",
  description: "Articles, guides d'achat et FAQ bien-être — formulations prudentes et non trompeuses.",
};

const THEMES = ["Peau", "Hygiène", "Bébé", "Saisonnalité", "Bien-être"];

export default function ConseilsPage() {
  return (
    <>
      <PageHeader
        title="Conseils & contenus"
        description="Guides d'achat et articles par thématique. Informations générales, sans promesse médicale."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <span key={t} className="rounded-full bg-shifaa-lime/30 px-4 py-1.5 text-sm font-medium">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ARTICLES.map((a) => (
            <article key={a.slug} className="card-surface p-6">
              <p className="text-xs font-medium uppercase text-shifaa-green">{a.category}</p>
              <h2 className="mt-2 font-display text-xl font-semibold">
                <Link href={`/conseils/${a.slug}`} className="hover:text-shifaa-green">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-shifaa-muted">{a.excerpt}</p>
              <p className="mt-4 text-xs text-shifaa-muted">
                {a.readTime} · {new Date(a.date).toLocaleDateString("fr-DZ")}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-16 card-surface p-8">
          <h2 className="font-display text-2xl font-semibold">FAQ santé & bien-être</h2>
          <p className="mt-2 text-sm text-shifaa-muted">
            Réponses générales. Pour tout problème de santé, consultez un professionnel.
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
              <div key={item.q}>
                <dt className="font-medium">{item.q}</dt>
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
