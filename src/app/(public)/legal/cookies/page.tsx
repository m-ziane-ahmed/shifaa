import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Politique cookies" };

export default function CookiesPage() {
  return (
    <>
      <PageHeader title="Politique de gestion des cookies" />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 prose-shifaa space-y-4 text-sm">
        <h2 className="font-semibold text-shifaa-ink">Cookies essentiels</h2>
        <p>Nécessaires au panier, à la session et à la sécurité du site.</p>
        <h2 className="font-semibold text-shifaa-ink">Cookies analytiques</h2>
        <p>Mesure d&apos;audience anonymisée — activés uniquement avec votre consentement.</p>
        <h2 className="font-semibold text-shifaa-ink">Gérer vos préférences</h2>
        <p>
          Vous pouvez modifier votre choix en supprimant le cookie « shifaa-cookie-consent » dans votre
          navigateur ou via le bandeau affiché lors de votre première visite.
        </p>
      </div>
    </>
  );
}
