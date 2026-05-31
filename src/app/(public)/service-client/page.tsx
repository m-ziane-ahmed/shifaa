import Link from "next/link";
import { Phone, Mail, Shield, Truck, RotateCcw, Package, FileText, Star } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Service client | Shifaa",
  description: "Centre d'aide, suivi commande, retours, contact — Shifaa parapharmacie Algérie.",
};

const SECTIONS = [
  { href: "/service-client/livraison", icon: Truck, title: "Livraison", desc: "Couverture nationale, délais par wilaya, point relais.", color: "text-blue-500 bg-blue-50" },
  { href: "/service-client/retours", icon: RotateCcw, title: "Retours & remboursements", desc: "Conditions, délais et procédure simplifiée.", color: "text-orange-500 bg-orange-50" },
  { href: "/service-client/suivi", icon: Package, title: "Suivi de commande", desc: "Suivez votre colis en temps réel.", color: "text-green-500 bg-green-50" },
  { href: "/compte/commandes", icon: FileText, title: "Mes commandes", desc: "Historique et gestion de vos achats.", color: "text-purple-500 bg-purple-50" },
];

const FAQ = [
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Paiement à la livraison, carte CIB et Edahabia (selon disponibilité selon les wilayas)." },
  { q: "Livrez-vous dans toutes les wilayas ?", a: "Oui, nous couvrons les 58 wilayas. Les délais et tarifs varient selon la zone géographique." },
  { q: "Puis-je retourner un produit ?", a: "Oui, sous conditions de conformité — produit non ouvert, dans son emballage d'origine. Consultez notre politique de retours." },
  { q: "Comment suivre ma commande ?", a: "Connectez-vous à votre espace client, rubrique « Mes commandes », ou utilisez notre page de suivi avec votre numéro de commande." },
  { q: "Vos produits sont-ils authentiques ?", a: "Tous nos produits sont approvisionnés auprès de distributeurs agréés. Authenticité garantie sur l'ensemble de notre catalogue." },
  { q: "Combien de temps pour recevoir ma commande ?", a: "En général 1–5 jours ouvrés selon votre wilaya. Alger, Oran, Constantine : 24–48h. Consultez les délais par wilaya." },
];

const ENGAGEMENTS = [
  { icon: "⏱️", label: "Réponse sous 24h", sub: "Tickets et emails" },
  { icon: "🟢", label: "Sam.–Jeu. 9h–18h", sub: "Service client disponible" },
  { icon: "⭐", label: "Satisfaction garantie", sub: "Taux de résolution > 95%" },
  { icon: "🛡️", label: "Produits authentiques", sub: "Fournisseurs agréés" },
];

export default function ServiceClientPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Service client" }]} />
      </div>

      {/* Header */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <h1 className="font-display text-3xl font-semibold text-shifaa-ink">
            Centre d&apos;aide
          </h1>
          <p className="mt-2 text-shifaa-muted max-w-xl">
            Nous sommes à votre écoute du samedi au jeudi, 9h–18h. Retrouvez toutes les réponses
            à vos questions ou contactez-nous directement.
          </p>
          {/* Canaux rapides */}
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors">
              💬 WhatsApp Business
            </a>
            <a href={`tel:${SITE.phoneTel}`}
              className="flex items-center gap-2 rounded-xl border border-shifaa-border bg-white px-4 py-2 text-sm font-medium text-shifaa-ink hover:border-shifaa-green transition-colors">
              <Phone className="h-4 w-4 text-shifaa-green" />
              {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`}
              className="flex items-center gap-2 rounded-xl border border-shifaa-border bg-white px-4 py-2 text-sm font-medium text-shifaa-ink hover:border-shifaa-green transition-colors">
              <Mail className="h-4 w-4 text-shifaa-green" />
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 space-y-12">

        {/* Engagements service */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ENGAGEMENTS.map(({ icon, label, sub }) => (
              <div key={label} className="card-surface p-4 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-sm font-semibold text-shifaa-ink">{label}</p>
                <p className="text-xs text-shifaa-muted mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sections aide rapide */}
        <section>
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-4">
            Aide rapide
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map(({ href, icon: Icon, title, desc, color }) => (
              <Link key={href} href={href}
                className="card-surface group flex flex-col p-5 hover:shadow-lift hover:border-shifaa-green/40 transition-all">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-shifaa-ink group-hover:text-shifaa-green text-sm">
                  {title}
                </h3>
                <p className="mt-1 text-xs text-shifaa-muted">{desc}</p>
                <span className="mt-3 text-xs font-medium text-shifaa-green">En savoir plus →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ enrichie */}
        <section>
          <h2 className="font-display text-xl font-semibold text-shifaa-ink mb-4">
            Questions fréquentes
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="card-surface group">
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-medium text-shifaa-ink">
                  {q}
                  <span className="ml-2 shrink-0 text-shifaa-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="border-t border-shifaa-border px-5 pb-5 pt-3 text-sm text-shifaa-muted">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact & ticket */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Formulaire de contact */}
          <div className="card-surface p-6">
            <h2 className="font-semibold text-shifaa-ink flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-shifaa-green" />
              Nous écrire
            </h2>
            <p className="text-sm text-shifaa-muted mb-4">
              Remplissez ce formulaire et nous vous répondons sous 24h ouvrées.
            </p>
            <Link href="/contact"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              Accéder au formulaire →
            </Link>
          </div>

          {/* Ticket SAV */}
          <div className="card-surface p-6">
            <h2 className="font-semibold text-shifaa-ink flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-shifaa-green" />
              Ouvrir un ticket SAV
            </h2>
            <p className="text-sm text-shifaa-muted mb-4">
              Problème avec une commande, un produit ou un remboursement ?
              Créez un ticket et suivez son avancement.
            </p>
            <div className="space-y-2">
              <Link href="/compte"
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                Créer un ticket dans mon espace
              </Link>
              <p className="text-xs text-center text-shifaa-muted">
                ou utilisez le 💬 widget en bas à droite
              </p>
            </div>
          </div>
        </section>

        {/* Satisfaction */}
        <section className="card-surface p-6 text-center">
          <Star className="h-6 w-6 text-amber-400 mx-auto mb-2" />
          <h2 className="font-semibold text-shifaa-ink mb-1">Votre avis compte</h2>
          <p className="text-sm text-shifaa-muted max-w-md mx-auto mb-4">
            Aidez-nous à améliorer notre service client en partageant votre expérience.
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-shifaa-border text-sm font-medium hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-shifaa-muted">
            1 = Très insatisfait · 5 = Très satisfait
          </p>
        </section>
      </div>
    </>
  );
}
