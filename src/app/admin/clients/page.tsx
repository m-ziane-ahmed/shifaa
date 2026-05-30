import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients | Admin Shifaa" };

async function addLoyaltyPoints(userId: string, points: number) {
  "use server";
  const supabase = createAdminClient();
  await supabase.rpc("add_loyalty_points", { user_id: userId, points });
  revalidatePath("/admin/clients");
}

async function bulkAddPoints(points: number) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("profiles")
    .update({ loyalty_points: supabase.rpc("add_loyalty_points" as never) })
    .eq("role", "user");
  // Simple update direct
  const { data: profiles } = await supabase.from("profiles").select("id").eq("role", "user");
  for (const p of profiles ?? []) {
    await supabase.rpc("add_loyalty_points", { user_id: p.id, points });
  }
  revalidatePath("/admin/clients");
}

export default async function AdminClients({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; segment?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 20;

  // Jointure auth.users pour l'email via une vue
  let query = supabase
    .from("profiles")
    .select(`
      id, name, phone, loyalty_points, role, created_at,
      orders(count)
    `, { count: "exact" })
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.segment === "vip") query = query.gte("loyalty_points", 1000);
  if (params.segment === "new") {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", lastWeek);
  }

  const { data: clients, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{count} client(s) enregistré(s)</p>
        </div>
        <a
          href="/api/admin/export/clients"
          className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ⬇ Export CSV
        </a>
      </div>

      {/* Bulk points */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-medium text-gray-800 mb-3">Actions en masse</h2>
        <form className="flex items-center gap-3"
          action={async (fd: FormData) => {
            "use server";
            await bulkAddPoints(Number(fd.get("points")));
          }}>
          <input name="points" type="number" min={1} defaultValue={100} placeholder="Points à ajouter"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          <button type="submit"
            className="bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors">
            ⭐ Ajouter points à tous
          </button>
        </form>
      </div>

      {/* Filtres & segments */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <form className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={params.q} placeholder="Rechercher par nom..."
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          <div className="flex gap-2">
            {[
              { value: "", label: "Tous" },
              { value: "vip", label: "VIP (≥1000 pts)" },
              { value: "new", label: "Nouveaux (7j)" },
            ].map((seg) => (
              <a key={seg.value} href={`?segment=${seg.value}`}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                  ${(params.segment ?? "") === seg.value
                    ? "bg-[#18534F] text-white border-transparent"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {seg.label}
              </a>
            ))}
          </div>
          <button type="submit" className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Rechercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-center">Commandes</th>
              <th className="px-4 py-3 text-center">Points fidélité</th>
              <th className="px-4 py-3 text-left">Inscrit le</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(clients ?? []).map((c) => {
              const orderCount = (c.orders as { count: number }[])?.[0]?.count ?? 0;
              const isVip = c.loyalty_points >= 1000;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#18534F]/10 flex items-center justify-center text-xs font-medium text-[#18534F]">
                        {(c.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{c.name || "—"}</p>
                        {isVip && <span className="text-xs text-amber-600 font-medium">⭐ VIP</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-center">{orderCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${isVip ? "text-amber-600" : "text-gray-600"}`}>
                      {c.loyalty_points} pts
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString("fr-DZ")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form className="inline-flex items-center gap-1"
                      action={async (fd: FormData) => {
                        "use server";
                        await addLoyaltyPoints(c.id, Number(fd.get("pts")));
                      }}>
                      <input name="pts" type="number" defaultValue={50} min={1}
                        className="w-16 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none" />
                      <button type="submit" className="text-xs text-[#18534F] hover:underline">+pts</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && <a href={`?page=${page - 1}&segment=${params.segment ?? ""}&q=${params.q ?? ""}`}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">← Précédent</a>}
              {page < totalPages && <a href={`?page=${page + 1}&segment=${params.segment ?? ""}&q=${params.q ?? ""}`}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Suivant →</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
