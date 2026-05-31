import { PageHeader } from "@/components/PageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanierContent } from "@/components/PanierContent";

export const metadata = { title: "Panier" };

export default function PanierPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Panier" }]} />
      </div>
      <PageHeader title="Votre panier" description="Récapitulatif clair avant validation de commande." />
      <PanierContent />
    </>
  );
}
