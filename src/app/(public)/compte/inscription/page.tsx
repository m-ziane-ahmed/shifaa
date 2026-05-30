import { Suspense } from "react";
import InscriptionForm from "./InscriptionForm";

export const metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-shifaa-muted">Chargement…</p>}>
      <InscriptionForm />
    </Suspense>
  );
}
