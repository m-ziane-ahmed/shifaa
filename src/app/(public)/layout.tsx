import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/PageLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BottomNav } from "@/components/BottomNav";
import { PWAManager } from "@/components/PWAManager";
import { HeaderOffset } from "@/components/HeaderOffset";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageLoader />
      <Header />
      <HeaderOffset>{children}</HeaderOffset>
      <Footer />
      <ScrollToTop />
      <BottomNav />
      <PWAManager />
      <CookieConsent />
    </div>
  );
}
