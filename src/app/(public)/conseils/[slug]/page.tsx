import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "@/data/articles";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  return { title: article?.title ?? "Article" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link href="/conseils" className="text-sm text-shifaa-green hover:underline">
        ← Retour aux conseils
      </Link>
      <p className="mt-6 text-sm font-medium text-shifaa-green">{article.category}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{article.title}</h1>
      <p className="mt-4 text-shifaa-muted">{article.excerpt}</p>
      <div className="mt-10 prose-shifaa space-y-4">
        <p>
          Ce contenu est fourni à titre informatif uniquement. Il ne remplace pas l&apos;avis d&apos;un
          professionnel de santé. Les recommandations peuvent varier selon votre situation personnelle.
        </p>
        <p>
          Pour choisir un produit adapté, consultez les fiches détaillées de notre boutique et les
          mentions légales sur chaque emballage.
        </p>
      </div>
      <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Avertissement : aucune information de cet article ne constitue un diagnostic ou une
        prescription médicale.
      </div>
    </article>
  );
}
