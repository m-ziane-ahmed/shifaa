import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commandes | Admin Shifaa" };

async function updateStatus(id: string, status: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/commandes");
}

const STATUS_OPTIONS = [
  { value: "",          label: "Tous les statuts" },
  { value: "pending",   label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "shipped",   label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string; nextColor?: string }> = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-800",  next: "confirmed", nextLabel: "✓ Confirmer",    nextColor: "bg-blue-500 text-white" },
  confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-800",    next: "shipped",   nextLabel: "🚚 Expédier",    nextColor: "bg-purple-500 text-white" },
  shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-800", next: "delivered", nextLabel: "✅ Livrée",     nextColor: "bg-green-500 text-white" },
  delivered: { label: "Livrée",      color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-800" },
};

export default async function AdminCommandes({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 25;

  let query = supabase
    .from("orders")
    .select("*, profiles(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.status) query = query.eq("status", params.status);
  if (params.q) query = query.or(`id.ilike.%${params.q}%,guest_name.ilike.%${params.q}%,wilaya.ilike.%${params.q}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  // Compteurs par statut
  const { data: counts } = await supabase
    .from("orders")
    .select("status");
  const statusCounts = (counts ?? []).reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{count} commande{(count ?? 0) > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/rapports" className="text-xs text-shifaa-green hover:underline">Voir les rapports →</Link>
      </div>

      {/* Filtres par statut — pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPTIONS.map((o) => {
          const cnt = o.value ? (statusCounts[o.value] ?? 0) : (count ?? 0);
          return (
            <Link key={o.value}
              href={`/admin/commandes?status=${o.value}${params.q ? `&q=${params.q}` : ""}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all
                ${params.status === o.value || (!params.status && !o.value)
                  ? "bg-shifaa-green text-white border-shifaa-green shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {o.label}
              {cnt > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${params.status === o.value || (!params.status && !o.value) ? "bg-white/20" : "bg-gray-100"}`}>
                  {cnt}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <form className="flex gap-2">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input name="q" defaultValue={params.q}
            placeholder="N° commande, client, wilaya…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
          <button type="submit"
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark">
            Rechercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["N° commande", "Client", "Wilaya", "Paiement", "Total", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders ?? []).map((o) => {
                const st = STATUS_CONFIG[o.status] ?? { label: o.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-3">
                      <Link href={`/admin/commandes/${o.id}`}
                        className="font-mono text-[11px] text-shifaa-green hover:underline">
                        {o.id.slice(0, 13)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-[120px] truncate">
                        {o.guest_name ?? (o.profiles as { name: string } | null)?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {(o.profiles as { phone: string } | null)?.phone ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.wilaya}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase font-medium">
                        {o.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatDZD(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Bouton action rapide */}
                        {st.next && (
                          <form action={async () => {
                            "use server";
                            await updateStatus(o.id, st.next!);
                          }}>
                            <button type="submit"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition hover:opacity-90 ${st.nextColor}`}>
                              {st.nextLabel}
                            </button>
                          </form>
                        )}
                        {/* Annuler si pas encore livré */}
                        {!["delivered", "cancelled"].includes(o.status) && (
                          <form action={async () => {
                            "use server";
                            await updateStatus(o.id, "cancelled");
                          }}>
                            <button type="submit"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
                              ✗
                            </button>
                          </form>
                        )}
                        <Link href={`/admin/commandes/${o.id}`}
                          className="text-xs text-gray-400 hover:text-shifaa-green transition">
                          →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} / {totalPages} · {count} résultats</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}&status=${params.status ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
                  ← Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}&status=${params.status ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
                  Suivant →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
