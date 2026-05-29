import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata = { title: "Conditions générales de vente" };

export default function CGVPage() {
  return (
    <>
      <PageHeader title="Conditions générales de vente" />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 prose-shifaa space-y-4 text-sm">
        <p><em>Document modèle — à valider par votre conseil juridique avant mise en ligne.</em></p>
        <h2 className="text-lg font-semibold text-shifaa-ink">1. Objet</h2>
        <p>
          Les présentes CGV régissent les ventes de produits parapharmaceutiques effectuées sur le site
          Les ventes sont effectuées par {SITE.companyName}, {SITE.address.full}, immatriculée
          sous le n° {SITE.legalIds}.
        </p>
        <h2 className="text-lg font-semibold text-shifaa-ink">2. Produits</h2>
        <p>
          Seuls les produits entrant dans le périmètre parapharmaceutique autorisé sont commercialisés.
          Aucun médicament soumis à prescription n&apos;est vendu sur ce site.
        </p>
        <h2 className="text-lg font-semibold text-shifaa-ink">3. Prix</h2>
        <p>Les prix sont affichés en dinars algériens (DZD), toutes taxes comprises sauf mention contraire.</p>
        <h2 className="text-lg font-semibold text-shifaa-ink">4. Commande et paiement</h2>
        <p>Modalités : paiement à la livraison, CIB, Edahabia selon options proposées au checkout.</p>
        <h2 className="text-lg font-semibold text-shifaa-ink">5. Livraison</h2>
        <p>Délais et frais communiqués avant validation de la commande, selon la wilaya choisie.</p>
      </div>
    </>
  );
}
