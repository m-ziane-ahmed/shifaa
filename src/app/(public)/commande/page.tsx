import { PageHeader } from "@/components/PageHeader";
import { CheckoutWizard } from "@/components/CheckoutWizard";

export const metadata = { title: "Commande" };

export default function CommandePage() {
  return (
    <>
      <PageHeader
        title="Finaliser votre commande"
        description="Tunnel en 3 étapes — livraison, paiement, confirmation."
      />
      <CheckoutWizard />
    </>
  );
}
