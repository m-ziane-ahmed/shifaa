import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Droit de rétractation" };

export default function RetractationPage() {
  return (
    <>
      <PageHeader title="Droit de rétractation et retours" />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 prose-shifaa space-y-4 text-sm">
        <p>
          Conformément à la réglementation applicable au commerce électronique en Algérie, le
          consommateur peut exercer son droit de rétractation dans les conditions et délais prévus par
          la loi.
        </p>
        <p>
          Exceptions possibles pour les produits descellés par mesure d&apos;hygiène ou de protection de
          la santé, conformément aux textes en vigueur.
        </p>
      </div>
    </>
  );
}
