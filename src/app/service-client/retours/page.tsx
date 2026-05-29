import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Retours" };

export default function RetoursPage() {
  return (
    <>
      <PageHeader title="Politique de retours" />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 prose-shifaa space-y-4">
        <p>
          Vous disposez d&apos;un délai de rétractation conforme à la réglementation applicable au
          commerce électronique en Algérie, sous réserve que le produit soit retourné dans son
          emballage d&apos;origine, non ouvert lorsque l&apos;hygiène l&apos;exige.
        </p>
        <p>
          Les produits descellés dont l&apos;ouverture empêche toute revente pour raisons d&apos;hygiène
          ou de protection de la santé ne peuvent être repris, sauf défaut avéré.
        </p>
        <p>
          Pour initier un retour, connectez-vous à votre compte ou contactez le service client avec
          votre numéro de commande.
        </p>
        <Link href="/legal/retractation" className="font-medium text-shifaa-green hover:underline">
          Droit de rétractation (détail légal) →
        </Link>
      </div>
    </>
  );
}
