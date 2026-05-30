import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WILAYAS } from "@/data/wilayas";

export const metadata = { title: "Livraison" };

export default function LivraisonPage() {
  return (
    <>
      <PageHeader
        title="Informations livraison"
        description="Couverture nationale, délais moyens et options par wilaya."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="prose-shifaa max-w-3xl space-y-4">
          <p>
            Nous livrons dans les 58 wilayas d&apos;Algérie. Les délais indiqués sont des estimations
            moyennes, susceptibles de varier selon la disponibilité du transporteur.
          </p>
          <p>
            <strong>À domicile</strong> : livraison à l&apos;adresse indiquée lorsque la wilaya est
            couverte. <strong>Point relais / Stop-desk</strong> : retrait dans un point partenaire
            lorsque disponible.
          </p>
        </div>
        <div className="mt-10 overflow-x-auto card-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-shifaa-border bg-shifaa-cream">
                <th className="px-4 py-3 text-left font-medium">Wilaya</th>
                <th className="px-4 py-3 text-left font-medium">Délai estimé</th>
                <th className="px-4 py-3 text-left font-medium">Domicile</th>
                <th className="px-4 py-3 text-left font-medium">Point relais</th>
              </tr>
            </thead>
            <tbody>
              {WILAYAS.map((w) => (
                <tr key={w.code} className="border-b border-shifaa-border">
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3 text-shifaa-muted">{w.deliveryDays}</td>
                  <td className="px-4 py-3">{w.homeDelivery ? "Oui" : "Non"}</td>
                  <td className="px-4 py-3">{w.relayAvailable ? "Oui" : "Non"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-xs text-shifaa-muted">
            Liste indicative — tableau complet à compléter avant mise en production.
          </p>
        </div>
        <Link href="/service-client" className="mt-8 inline-block text-sm text-shifaa-green hover:underline">
          ← Service client
        </Link>
      </div>
    </>
  );
}
