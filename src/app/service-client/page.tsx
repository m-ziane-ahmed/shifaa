import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata = { title: "Service client" };

const SECTIONS = [
  {
    href: "/service-client/livraison",
    title: "Livraison",
    desc: "Couverture nationale, délais par wilaya, point relais et stop-desk.",
  },
  {
    href: "/service-client/retours",
    title: "Retours & remboursement",
    desc: "Conditions, délais et procédure de retour.",
  },
  {
    href: "/service-client/suivi",
    title: "Suivi de commande",
    desc: "Suivez votre colis avec votre numéro de commande.",
  },
];

const FAQ = [
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Paiement à la livraison, carte CIB et Edahabia selon disponibilité.",
  },
  {
    q: "Livrez-vous dans toutes les wilayas ?",
    a: "Nous couvrons l'ensemble du territoire national. Les délais et options varient selon la wilaya.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Oui, dans le respect de notre politique de retours et du droit de rétractation applicable.",
  },
];

export default function ServiceClientPage() {
  return (
    <>
      <PageHeader
        title="Service client"
        description="Nous sommes à votre écoute du samedi au jeudi, 9h–18h."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="card-surface p-6 transition hover:shadow-lift">
              <h2 className="font-semibold hover:text-shifaa-green">{s.title}</h2>
              <p className="mt-2 text-sm text-shifaa-muted">{s.desc}</p>
            </Link>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-xl font-semibold">Questions fréquentes</h2>
          <dl className="mt-6 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="card-surface p-6">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm text-shifaa-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 card-surface p-8 text-center">
          <h2 className="font-semibold">Besoin d&apos;aide ?</h2>
          <p className="mt-2 text-sm text-shifaa-muted">
            {SITE.email} · {SITE.phone}
          </p>
          <Link href="/contact" className="btn-primary mt-6 inline-flex">
            Nous contacter
          </Link>
        </section>
      </div>
    </>
  );
}
