import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historique mouvements | Admin Shifaa" };

export default async function MouvementsPage() {
  const supabase = createAdminClient();

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*, products(name, brand)")
    .order("created_at", { ascending: false })
    .limit(100);

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    entry:      { label: "Entrée",      color: "text-green-700",  bg: "bg-green-100" },
    exit:       { label: "Sortie",      color: "text-red-700",    bg: "bg-red-100" },
    transfer:   { label: "Transfert",   color: "text-blue-700",   bg: "bg-blue-100" },
    adjustment: { label: "Ajustement",  color: "text-amber-700",  bg: "bg-amber-100" },
    return:     { label: "Retour",      color: "text-purple-700", bg: "bg-purple-100" },
    defect:     { label: "Défaut",      color: "text-gray-700",   bg: "bg-gray-100" },
    reserved:   { label: "Réservé",     color: "text-orange-700", bg: "bg-orange-100" },
    released:   { label: "Libéré",      color: "text-cyan-700",   bg: "bg-cyan-100" },
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Historique</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Historique des mouvements</h1>
          <p className="text-sm text-gray-500">{(movements ?? []).length} mouvements affichés</p>
        </div>
        <Link href="/admin/stocks/mouvement"
          className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
          + Nouveau mouvement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Date & heure", "Produit", "Type", "Quantité", "Avant", "Après", "Référence", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(movements ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucun mouvement enregistré
                  </td>
                </tr>
              ) : (movements ?? []).map((m) => {
                const tc = typeConfig[m.movement_type] ?? { label: m.movement_type, color: "text-gray-600", bg: "bg-gray-100" };
                const product = m.products as { name: string; brand: string } | null;
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-[160px] truncate">{product?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{product?.brand}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.color}`}>
                        {tc.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{m.qty_before}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.qty_after}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{m.reference ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{m.notes ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
