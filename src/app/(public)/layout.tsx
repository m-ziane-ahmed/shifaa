import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/PageLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BottomNav } from "@/components/BottomNav";
import { PWAManager } from "@/components/PWAManager";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLoader />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <ScrollToTop />
      <BottomNav />
      <PWAManager />
      <CookieConsent />
    </>
  );
}
