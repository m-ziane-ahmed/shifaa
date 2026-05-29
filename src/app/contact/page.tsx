import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { SITE } from "@/lib/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="Une question sur une commande, un produit ou la livraison ? Écrivez-nous."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <ContactForm />
          <div className="space-y-6">
            <div className="card-surface p-6">
              <h2 className="font-semibold">Coordonnées</h2>
              <p className="mt-3 text-sm text-shifaa-muted">
                E-mail :{" "}
                <a href={`mailto:${SITE.email}`} className="text-shifaa-green hover:underline">
                  {SITE.email}
                </a>
                <br />
                Téléphone :{" "}
                <a href={`tel:${SITE.phoneTel}`} className="text-shifaa-green hover:underline">
                  {SITE.phone}
                </a>
                <br />
                WhatsApp :{" "}
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shifaa-green hover:underline"
                >
                  {SITE.phone}
                </a>
                <br />
                {SITE.hoursLong}
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-shifaa-ink">Réseaux sociaux</p>
                <SocialLinks variant="light" className="mt-2" />
              </div>
            </div>
            <div className="card-surface p-6">
              <h2 className="font-semibold">Adresse</h2>
              <p className="mt-3 text-sm text-shifaa-muted leading-relaxed">
                {SITE.address.street}
                <br />
                {SITE.address.postalCode} {SITE.address.city}
                <br />
                {SITE.address.wilaya}, {SITE.address.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
