import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CompteDashboard } from "@/components/CompteDashboard";

export const metadata = { title: "Mon compte" };

export default function ComptePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Mon compte" }]} />
      </div>
      <PageHeader title="Mon compte" description="Gérez vos commandes, adresses et préférences." />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Suspense fallback={<p className="text-shifaa-muted">Chargement…</p>}>
          <CompteDashboard />
        </Suspense>
      </div>
    </>
  );
}
