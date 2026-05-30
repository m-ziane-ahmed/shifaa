import Link from "next/link";
import { Shield, Phone, Mail, MapPin, Clock, Award, Users, Package, Star, CheckCircle, FileText } from "lucide-react";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PHARMACY_EXPERT } from "@/data/team";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "À propos de Shifaa",
  description: "Découvrez Shifaa, boutique parapharmaceutique en ligne spécialisée en Algérie. Notre mission, nos engagements qualité et notre équipe.",
};

const STATS = [
  { icon: Package, value: "1 500+", label: "Références disponibles" },
  { icon: Users, value: "5 000+", label: "Clients servis" },
  { icon: Star, value: "4.8/5", label: "Satisfaction client" },
  { icon: Shield, value: "100%", label: "Produits authentiques" },
];

const ENGAGEMENTS = [
  { icon: Shield, title: "Authenticité garantie", desc: "Approvisionnement exclusif auprès de distributeurs agréés. Chaque produit est contrôlé avant mise en vente." },
  { icon: CheckCircle, title: "Transparence tarifaire", desc: "Prix affichés en DZD TTC, frais de livraison calculés au panier, aucun frais caché." },
  { icon: FileText, title: "Conformité réglementaire", desc: "Catalogue limité au périmètre parapharmaceutique autorisé. Mentions légales présentes sur chaque fiche produit." },
  { icon: Award, title: "Expertise scientifique", desc: "Direction scientifique assurée par un docteur en pharmacie diplômé pour valider nos contenus et notre sélection." },
];

const LEGAL_INFO = [
  { label: "Raison sociale", value: SITE.companyName },
  { label: "Adresse", value: SITE.address.full },
  { label: "RC / NIF / IFU", value: SITE.legalIds },
  { label: "Email", value: SITE.email },
  { label: "Téléphone", value: SITE.phone },
  { label: "Horaires", value: `Service client ${SITE.hoursLong}` },
];

export default function AProposPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "À propos" }]} />
      </div>

      {/* Hero */}
      <div className="border-b border-shifaa-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <h1 className="font-display text-4xl font-semibold text-shifaa-ink">
            À propos de Shifaa
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-shifaa-muted leading-relaxed">
            Une boutique parapharmaceutique pensée pour l&apos;Algérie — honnête, transparente et accessible.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 space-y-16">

        {/* Stats de confiance */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="card-surface p-6 text-center">
                <Icon className="h-6 w-6 text-shifaa-green mx-auto mb-2" />
                <p className="text-3xl font-bold text-shifaa-ink">{value}</p>
                <p className="text-sm text-shifaa-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-shifaa-ink mb-4">Notre mission</h2>
            <div className="space-y-4 text-shifaa-muted leading-relaxed">
              <p>
                <strong className="text-shifaa-ink">Shifaa</strong> (شفاء — le réconfort, le mieux-être)
                est une boutique en ligne spécialisée dans les produits parapharmaceutiques.
                Notre mission : vous accompagner au quotidien avec des produits d&apos;hygiène,
                de soin et de bien-être, dans un cadre clair et transparent.
              </p>
              <p>
                Nous ne sommes pas une pharmacie. Nous ne vendons pas de médicaments sur ordonnance.
                Chaque fiche produit indique sa catégorie et les limites d&apos;usage, sans promesse
                médicale indue.
              </p>
              <p>
                Fondée en Algérie, pour l&apos;Algérie — nous connaissons les besoins de nos clients,
                les contraintes logistiques locales, et nous y répondons avec pragmatisme et rigueur.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-shifaa-lime/15 border border-shifaa-lime/30 p-6">
            <h3 className="font-semibold text-shifaa-ink mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-shifaa-green" />
              Nos engagements qualité
            </h3>
            <ul className="space-y-3">
              {[
                "Prix affichés en DZD, frais de livraison et retours expliqués clairement",
                "Descriptions loyales et conformes à la réglementation",
                "Service client accessible et réactif",
                "Catalogue limité au périmètre autorisé",
                "Produits approvisionnés auprès de distributeurs agréés",
                "Direction scientifique par un docteur en pharmacie",
              ].map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-sm text-shifaa-muted">
                  <CheckCircle className="h-4 w-4 text-shifaa-green shrink-0 mt-0.5" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Expertise scientifique */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-shifaa-ink mb-6">Direction scientifique</h2>
          <div className="card-surface p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-shifaa-green text-white text-2xl">
                👩‍⚕️
              </div>
              <div className="flex-1">
                <p className="font-display text-xl font-semibold text-shifaa-ink">{PHARMACY_EXPERT.name}</p>
                <p className="text-sm font-medium text-shifaa-green mt-0.5">{PHARMACY_EXPERT.title}</p>
                <p className="text-sm text-shifaa-muted mt-1">{PHARMACY_EXPERT.role}</p>
                <p className="mt-3 text-sm text-shifaa-muted leading-relaxed">{PHARMACY_EXPERT.credentials}</p>
                <div className="mt-4 space-y-2">
                  {PHARMACY_EXPERT.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 text-sm text-shifaa-muted">
                      <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ExpertiseSection variant="about" />
        </section>

        {/* Nos garanties */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-shifaa-ink mb-6">Nos garanties</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ENGAGEMENTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-surface p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-shifaa-lime/30">
                    <Icon className="h-5 w-5 text-shifaa-green" />
                  </div>
                  <h3 className="font-semibold text-shifaa-ink">{title}</h3>
                </div>
                <p className="text-sm text-shifaa-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Informations légales + contact */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Infos légales */}
          <div className="card-surface p-6">
            <h2 className="font-semibold text-shifaa-ink mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-shifaa-green" />
              Informations légales
            </h2>
            <dl className="space-y-3">
              {LEGAL_INFO.map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="text-xs font-medium text-shifaa-muted w-28 shrink-0">{label}</dt>
                  <dd className="text-sm text-shifaa-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 pt-4 border-t border-shifaa-border flex flex-wrap gap-3">
              {[
                { href: "/legal/cgv", label: "CGV" },
                { href: "/legal/confidentialite", label: "Confidentialité" },
                { href: "/legal/mentions", label: "Mentions légales" },
                { href: "/legal/perimetre", label: "Périmètre produits" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="card-surface p-6">
            <h2 className="font-semibold text-shifaa-ink mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-shifaa-green" />
              Nous contacter
            </h2>
            <div className="space-y-4">
              <a href={`tel:${SITE.phoneTel}`}
                className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-cream transition-colors">
                <Phone className="h-5 w-5 text-shifaa-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-shifaa-ink">{SITE.phone}</p>
                  <p className="text-xs text-shifaa-muted">Appel direct</p>
                </div>
              </a>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 hover:bg-green-100 transition-colors">
                <span className="text-xl shrink-0">💬</span>
                <div>
                  <p className="text-sm font-medium text-green-800">WhatsApp Business</p>
                  <p className="text-xs text-green-600">Réponse rapide</p>
                </div>
              </a>
              <a href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-cream transition-colors">
                <Mail className="h-5 w-5 text-shifaa-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-shifaa-ink">{SITE.email}</p>
                  <p className="text-xs text-shifaa-muted">Email</p>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3">
                <Clock className="h-5 w-5 text-shifaa-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-shifaa-ink">Horaires service client</p>
                  <p className="text-xs text-shifaa-muted">{SITE.hoursLong}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3">
                <MapPin className="h-5 w-5 text-shifaa-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-shifaa-ink">Adresse</p>
                  <p className="text-xs text-shifaa-muted">{SITE.address.full}</p>
                </div>
              </div>
            </div>
            <Link href="/contact"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green text-white py-2.5 text-sm font-medium hover:bg-[#0f3d3a] transition-colors">
              Formulaire de contact →
            </Link>
          </div>
        </section>

        <ComplianceBanner compact />
      </div>
    </>
  );
}
