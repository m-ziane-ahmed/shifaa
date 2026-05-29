import { PageHeader } from "@/components/PageHeader";
import { PanierContent } from "@/components/PanierContent";

export const metadata = { title: "Panier" };

export default function PanierPage() {
  return (
    <>
      <PageHeader title="Votre panier" description="Récapitulatif clair avant validation de commande." />
      <PanierContent />
    </>
  );
}
