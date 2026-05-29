import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";
import { ShifaaLogo } from "@/components/ShifaaLogo";

const FOOTER_LINKS = {
  Boutique: [
    { href: "/boutique", label: "Tous les produits" },
    { href: "/promotions", label: "Promotions" },
    { href: "/nouveautes", label: "Nouveautés" },
    { href: "/boutique?view=marques", label: "Marques" },
  ],
  Aide: [
    { href: "/service-client", label: "Service client" },
    { href: "/service-client/livraison", label: "Livraison" },
    { href: "/service-client/retours", label: "Retours" },
    { href: "/service-client/suivi", label: "Suivi de commande" },
  ],
  Légal: [
    { href: "/legal/cgv", label: "CGV" },
    { href: "/legal/confidentialite", label: "Confidentialité" },
    { href: "/legal/cookies", label: "Cookies" },
    { href: "/legal/perimetre", label: "Périmètre produits" },
  ],
  Entreprise: [
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/conseils", label: "Conseils" },
    { href: "/compte", label: "Mon compte" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-shifaa-footer text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="shrink-0 lg:max-w-xs">
            <ShifaaLogo />
            <p className="mt-3 text-sm text-white/75 leading-relaxed">
              Boutique spécialisée en produits parapharmaceutiques en Algérie. Hygiène, soins,
              compléments autorisés et accessoires — dans le respect du cadre réglementaire
              applicable.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/85">
              <p className="leading-relaxed">{SITE.address.full}</p>
              <p>Service client : {SITE.hoursLong}</p>
              <p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 hover:text-shifaa-lime"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {SITE.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${SITE.phoneTel}`}
                  className="inline-flex items-center gap-2 hover:text-shifaa-lime"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {SITE.phone}
                </a>
              </p>
            </div>
            <SocialLinks variant="footer" className="mt-5" iconClassName="h-4 w-4" />
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-10">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-shifaa-lime">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-white/75 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-center text-xs text-white/55">
          <p>
            © {new Date().getFullYear()} Shifaa — Parapharmacie en ligne. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
