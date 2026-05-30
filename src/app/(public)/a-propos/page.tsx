import { ComplianceBanner } from "@/components/ComplianceBanner";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { PageHeader } from "@/components/PageHeader";
import { PHARMACY_EXPERT } from "@/data/team";
import { SITE } from "@/lib/site";

export const metadata = { title: "À propos" };

export default function AProposPage() {
  return (
    <>
      <PageHeader
        title="À propos de Shifaa"
        description="Une boutique parapharmaceutique pensée pour l'Algérie."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <ComplianceBanner compact />
        <div className="mt-8 prose-shifaa space-y-4">
          <p>
            <strong>Shifaa</strong> (شفاء — le réconfort, le mieux-être) est une boutique en ligne
            spécialisée dans les produits parapharmaceutiques. Notre mission : vous accompagner au
            quotidien avec des produits d&apos;hygiène, de soin et de bien-être, dans un cadre clair et
            transparent.
          </p>
          <p>
            Nous ne sommes pas une pharmacie. Nous ne vendons pas de médicaments sur ordonnance. Chaque
            fiche produit indique sa catégorie et les limites d&apos;usage, sans promesse médicale indue.
          </p>
          <h2 id="equipe" className="text-xl font-semibold text-shifaa-ink scroll-mt-24">
            Notre équipe
          </h2>
          <p>
            Derrière Shifaa, une équipe engagée pour vous orienter avec clarté. La présence d&apos;une
            pharmacienne diplômée renforce la crédibilité de nos conseils et de notre sélection
            produits.
          </p>
          <ExpertiseSection variant="about" />

          <h2 className="text-xl font-semibold text-shifaa-ink">Notre engagement</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Prix affichés en DZD, frais de livraison et retours expliqués clairement</li>
            <li>Descriptions loyales et conformes à la réglementation</li>
            <li>Service client accessible et réactif</li>
            <li>Catalogue limité au périmètre autorisé</li>
          </ul>
          <h2 className="text-xl font-semibold text-shifaa-ink">Informations entreprise</h2>
          <p className="text-sm">
            <strong>Raison sociale :</strong> {SITE.companyName}
            <br />
            {SITE.address.full}
            <br />
            <strong>RC / NIF / IFU :</strong> {SITE.legalIds}
            <br />
            Horaires service client : {SITE.hoursLong}
          </p>
          <p className="text-sm text-shifaa-muted">
            Direction scientifique : {PHARMACY_EXPERT.name}, {PHARMACY_EXPERT.title}.
          </p>
        </div>
      </div>
    </>
  );
}
