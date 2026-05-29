import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = { title: "Commande confirmée" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderId = order ?? "SHF-XXXX";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center md:px-6">
      <CheckCircle className="mx-auto h-16 w-16 text-shifaa-green" />
      <h1 className="mt-6 font-display text-3xl font-semibold">Commande confirmée</h1>
      <p className="mt-3 text-shifaa-muted">
        Merci pour votre confiance. Votre commande{" "}
        <strong>#{orderId}</strong> est enregistrée. Un e-mail de confirmation vous sera envoyé.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/compte/commandes" className="btn-primary">
          Voir mes commandes
        </Link>
        <Link href="/boutique" className="btn-secondary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
