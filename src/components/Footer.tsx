import Link from "next/link";
import { Mail, Phone, Shield, Lock, Package, Star, Truck, Users } from "lucide-react";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";
import { ShifaaLogo } from "@/components/ShifaaLogo";

const FOOTER_LINKS = {
  Boutique: [
    { href: "/boutique", label: "Tous les produits" },
    { href: "/promotions", label: "Promotions" },
    { href: "/nouveautes", label: "Nouveautés" },
    { href: "/boutique?view=marques", label: "Marques" },
    { href: "/conseils", label: "Conseils & guides" },
  ],
  Aide: [
    { href: "/service-client", label: "Service client" },
    { href: "/service-client/livraison", label: "Livraison & délais" },
    { href: "/service-client/retours", label: "Retours & remboursements" },
    { href: "/service-client/suivi", label: "Suivi de commande" },
    { href: "/contact", label: "Nous contacter" },
  ],
  Légal: [
    { href: "/legal/cgv", label: "CGV" },
    { href: "/legal/confidentialite", label: "Confidentialité" },
    { href: "/legal/cookies", label: "Cookies" },
    { href: "/legal/perimetre", label: "Périmètre produits" },
    { href: "/legal/retractation", label: "Droit de rétractation" },
  ],
  Entreprise: [
    { href: "/a-propos", label: "À propos de Shifaa" },
    { href: "/a-propos#equipe", label: "Notre équipe" },
    { href: "/a-propos#engagement", label: "Nos engagements" },
    { href: "/compte", label: "Mon compte" },
  ],
};

const TRUST_BADGES = [
  { icon: Shield, label: "Produits authentiques" },
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: Package, label: "Livraison suivie" },
  { icon: Star, label: "Avis vérifiés" },
  { icon: Truck, label: "Retours simplifiés" },
  { icon: Users, label: "Service client réactif" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-shifaa-footer text-white">

      {/* Bande de confiance */}
      <div className="border-b border-white/10 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 md:px-6">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-white/60">
              <Icon className="h-3.5 w-3.5 text-shifaa-lime shrink-0" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">

          {/* Infos entreprise */}
          <div className="shrink-0 lg:max-w-xs">
            <ShifaaLogo />
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Boutique spécialisée en produits parapharmaceutiques en Algérie.
              Hygiène, soins, compléments autorisés et accessoires — dans le respect
              du cadre réglementaire applicable.
            </p>

            {/* Contact rapide */}
            <div className="mt-5 space-y-2 text-sm">
              <a href={`tel:${SITE.phoneTel}`}
                className="flex items-center gap-2 text-white/80 hover:text-shifaa-lime transition-colors">
                <Phone className="h-4 w-4 shrink-0 text-shifaa-lime" aria-hidden />
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 text-white/80 hover:text-shifaa-lime transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-shifaa-lime" aria-hidden />
                {SITE.email}
              </a>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-shifaa-lime transition-colors">
                <span className="text-sm shrink-0">💬</span>
                WhatsApp Business
              </a>
            </div>

            <p className="mt-3 text-xs text-white/50">{SITE.hoursLong}</p>

            <SocialLinks variant="footer" className="mt-5" iconClassName="h-4 w-4" />

            {/* Infos légales mini */}
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/40 leading-relaxed">
              <p className="font-medium text-white/60 mb-1">{SITE.companyName}</p>
              <p>{SITE.address.city}, {SITE.address.wilaya}</p>
              <p>RC/NIF/IFU : {SITE.legalIds}</p>
            </div>
          </div>

          {/* Liens */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-10">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-shifaa-lime">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}
                        className="text-sm text-white/65 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bas de footer */}
        <div className="mt-12 b order-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Shifaa — Parapharmacie en ligne. Tous droits réservés.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/40">
              {[
                { href: "/legal/cgv", label: "CGV" },
                { href: "/legal/confidentialite", label: "Confidentialité" },
                { href: "/legal/cookies", label: "Cookies" },
                { href: "/legal/perimetre", label: "Périmètre" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white/70 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
