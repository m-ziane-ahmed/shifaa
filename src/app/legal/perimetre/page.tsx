import { ComplianceBanner } from "@/components/ComplianceBanner";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Périmètre des produits" };

export default function PerimetrePage() {
  return (
    <>
      <PageHeader
        title="Notice d'information — périmètre produits"
        description="Limites de commercialisation selon la réglementation algérienne applicable."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <ComplianceBanner compact />
        <div className="mt-8 prose-shifaa space-y-4 text-sm">
          <h2 className="text-lg font-semibold text-shifaa-ink">Nature de la plateforme</h2>
          <p>
            Shifaa est une <strong>boutique de parapharmacie en ligne</strong>. Elle n&apos;est pas une
            pharmacie d&apos;officine et ne délivre aucun médicament sur ordonnance.
          </p>
          <h2 className="text-lg font-semibold text-shifaa-ink">Catégories autorisées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hygiène et soins du corps et du visage</li>
            <li>Soins capillaires</li>
            <li>Produits bébé et maternité (hors médicaments)</li>
            <li>Compléments alimentaires autorisés à la vente libre</li>
            <li>Bien-être et cosmétiques</li>
            <li>Dispositifs médicaux et accessoires autorisés en vente libre</li>
            <li>Produits bio et naturels dans le même cadre</li>
          </ul>
          <h2 className="text-lg font-semibold text-shifaa-ink">Exclusions</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Médicaments soumis à prescription médicale</li>
            <li>Stupéfiants et substances réglementées</li>
            <li>Tout produit dont la vente en ligne est interdite ou restreinte</li>
          </ul>
          <h2 className="text-lg font-semibold text-shifaa-ink">Obligation de conformité</h2>
          <p>
            Avant toute mise en production, le catalogue doit être vérifié par un responsable
            qualité/réglementaire au regard du commerce électronique et des règles applicables aux
            produits de santé en Algérie.
          </p>
        </div>
      </div>
    </>
  );
}
