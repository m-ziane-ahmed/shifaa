import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Page introuvable</h1>
      <p className="mt-4 text-shifaa-muted">La page demandée n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
