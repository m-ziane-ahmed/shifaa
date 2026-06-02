import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients | Admin Shifaa" };

export default async function AdminClients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; segment?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 25;

  let query = supabase
    .from("profiles")
    .select("id, name, phone, created_at", { count: "exact" })
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.segment === "new") {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", lastWeek);
  }

  const { data: clients, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  // Stats globales clients
  const { data: allProfiles } = await supabase.from("profiles").select("created_at").eq("role", "user");
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = (allProfiles ?? []).filter((p) => new Date(p.created_at) >= thisMonth).length;

  // Points fidélité depuis loyalty_points
  const { data: loyaltyData } = await supabase
    .from("loyalty_points")
    .select("user_id, points")
    .order("points", { ascending: false })
    .limit(pageSize);

  const loyaltyMap = Object.fromEntries((loyaltyData ?? []).map((l) => [l.user_id, l.points]));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {count ?? 0} inscrits · {newThisMonth} nouveaux ce mois
          </p>
        </div>
        <a href="/api/admin/export/clients"
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
          ⬇ Export CSV
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{(count ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Clients totaux</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-700">{newThisMonth}</p>
          <p className="text-xs text-green-500 mt-0.5">Nouveaux ce mois</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-700">
            {(loyaltyData ?? []).filter((l) => l.points >= 100).length}
          </p>
          <p className="text-xs text-amber-500 mt-0.5">Avec points fidélité</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <form className="flex-1 min-w-48">
          {params.segment && <input type="hidden" name="segment" value={params.segment} />}
          <input name="q" defaultValue={params.q}
            placeholder="Rechercher par nom…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
        </form>
        <div className="flex gap-2">
          {[
            { value: "", label: "Tous" },
            { value: "new", label: "Nouveaux (7j)" },
          ].map((seg) => (
            <Link key={seg.value} href={`?segment=${seg.value}`}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all
                ${(params.segment ?? "") === seg.value
                  ? "bg-shifaa-green text-white border-shifaa-green"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {seg.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Client", "Téléphone", "Points fidélité", "Inscrit le", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(clients ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Aucun client trouvé</td>
              </tr>
            ) : (clients ?? []).map((c) => {
              const pts = loyaltyMap[c.id] ?? 0;
              const isVip = pts >= 500;
              const initials = ((c.name || "?").split(" ").map((n: string) => n[0]).join("") || "?").slice(0, 2).toUpperCase();
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${isVip ? "bg-amber-100 text-amber-700" : "bg-shifaa-green/10 text-shifaa-green"}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.name || "—"}</p>
                        {isVip && <span className="text-[10px] text-amber-600 font-bold">⭐ VIP</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {pts > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, pts / 10)}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${isVip ? "text-amber-600" : "text-gray-600"}`}>
                          {pts} pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">0 pts</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes?q=${encodeURIComponent(c.name ?? "")}`}
                      className="text-xs text-shifaa-green hover:underline">
                      Commandes →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}&segment=${params.segment ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">← Précédent</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}&segment=${params.segment ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Suivant →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
