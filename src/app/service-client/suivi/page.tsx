import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import SuiviForm from "./SuiviForm";

export const metadata = { title: "Suivi de commande" };

export default function SuiviPage() {
  return (
    <>
      <PageHeader title="Suivi de commande" />
      <div className="mx-auto max-w-md px-4 py-10 md:px-6">
        <Suspense fallback={<p className="text-shifaa-muted">Chargement…</p>}>
          <SuiviForm />
        </Suspense>
      </div>
    </>
  );
}
