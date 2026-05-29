import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/PageLoader";
import { Providers } from "@/components/Providers";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shifaa — Boutique parapharmacie en Algérie",
    template: "%s | Shifaa",
  },
  description:
    "Boutique en ligne spécialisée en produits parapharmaceutiques : hygiène, soins, compléments autorisés et accessoires. Livraison nationale en DZD.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Shifaa",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/brand-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#18534F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          <PageLoader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
