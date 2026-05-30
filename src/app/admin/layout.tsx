import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/compte?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader user={{ email: user.email ?? "" }} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const links = [
    { href: "/admin", label: "Tableau de bord", icon: "📊" },
    { href: "/admin/commandes", label: "Commandes", icon: "🛒" },
    { href: "/admin/produits", label: "Produits", icon: "📦" },
    { href: "/admin/clients", label: "Clients", icon: "👥" },
    { href: "/admin/avis", label: "Avis", icon: "⭐" },
    { href: "/admin/codes-promo", label: "Codes promo", icon: "🎟️" },
    { href: "/admin/stock", label: "Stock", icon: "📋" },
  ];

  return (
    <aside className="w-56 bg-shifaa-dark min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <p className="font-display text-white text-lg font-semibold">Shifaa</p>
        <p className="text-white/50 text-xs mt-0.5">Back-office admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 text-xs transition-colors">
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}

function AdminHeader({ user }: { user: { email: string } }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-shifaa-green flex items-center justify-center text-white text-xs font-medium">
          {user.email[0].toUpperCase()}
        </div>
        <span className="text-sm text-gray-600">{user.email}</span>
      </div>
    </header>
  );
}
