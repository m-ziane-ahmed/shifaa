import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commandes | Admin Shifaa" };

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped:   "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée",
};

export default async function AdminCommandes({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const page = Number(params.page ?? 1);
  const pageSize = 20;

  let query = supabase
    .from("orders")
    .select("*, profiles(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.status) query = query.eq("status", params.status);
  if (params.q) query = query.or(`id.ilike.%${params.q}%,guest_name.ilike.%${params.q}%,wilaya.ilike.%${params.q}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
        <span className="text-sm text-gray-500">{count} commande{(count ?? 0) > 1 ? "s" : ""}</span>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap">
        <form className="flex gap-3 flex-wrap w-full">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="N° commande, client, wilaya…"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
          />
          <select
            name="status"
            defaultValue={params.status}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="submit" className="bg-shifaa-green text-white px-4 py-1.5 rounded-lg text-sm hover:bg-shifaa-dark transition-colors">
            Filtrer
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">N° commande</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Wilaya</th>
                <th className="px-4 py-3 text-left">Paiement</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{o.guest_name ?? (o.profiles as {name:string}|null)?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{o.guest_phone ?? (o.profiles as {phone:string}|null)?.phone ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{o.wilaya}</td>
                  <td className="px-4 py-3 uppercase text-xs text-gray-500">{o.payment}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatDZD(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString("fr-DZ")}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/commandes/${o.id}`} className="text-shifaa-green hover:underline text-xs">
                      Détails →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}&status=${params.status ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                  ← Précédent
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}&status=${params.status ?? ""}&q=${params.q ?? ""}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Suivant →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
