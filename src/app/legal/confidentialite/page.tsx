import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 prose-shifaa space-y-4 text-sm">
        <p><em>Document modèle — à adapter selon la loi algérienne sur la protection des données personnelles.</em></p>
        <p>
          Shifaa collecte les données nécessaires au traitement de vos commandes (identité, coordonnées,
          historique d&apos;achat). Ces données ne sont pas vendues à des tiers.
        </p>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression en contactant
          contact@shifaa.dz.
        </p>
      </div>
    </>
  );
}
