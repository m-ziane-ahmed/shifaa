import Link from "next/link";

export const metadata = { title: "Hors ligne | Shifaa" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">📡</p>
      <h1 className="font-display text-2xl font-semibold text-shifaa-ink mb-2">
        Vous êtes hors ligne
      </h1>
      <p className="text-shifaa-muted max-w-sm mb-6">
        Vérifiez votre connexion internet et réessayez. Vos produits favoris et vos commandes
        récentes restent accessibles dans votre compte.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">Retenter</Link>
        <Link href="/compte/commandes" className="btn-secondary">Mes commandes</Link>
      </div>
    </div>
  );
}
