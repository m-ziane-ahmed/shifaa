import type { Metadata, Viewport } from "next";
import { Rubik, Roboto } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

// ── Polices charte graphique prototype Shifaa ─────────────
const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
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
  themeColor: "#4aab3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${rubik.variable} ${roboto.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
