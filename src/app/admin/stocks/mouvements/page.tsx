import { createAdminClient } from "@/lib/supabase-server";
import { extractRelation } from "@/lib/supabase-helpers";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mouvements de stock | Admin Shifaa" };

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string; sign: string }> = {
  entry:      { label: "Entrée",       color: "bg-green-100 text-green-700",   icon: "📥", sign: "+" },
  exit:       { label: "Sortie",       color: "bg-red-100 text-red-700",       icon: "📤", sign: "−" },
  adjustment: { label: "Ajustement",  color: "bg-amber-100 text-amber-700",   icon: "⚙️", sign: "±" },
  return:     { label: "Retour",       color: "bg-blue-100 text-blue-700",     icon: "↩️", sign: "+" },
  defect:     { label: "Défaut",       color: "bg-gray-100 text-gray-600",    icon: "🗑️", sign: "−" },
  transfer:   { label: "Transfert",    color: "bg-purple-100 text-purple-700", icon: "🔄", sign: "±" },
};

export default async function MouvementsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; ref?: string; type?: string; page?: string }>;
}) {
  const params  = await searchParams;
  const view    = params.view ?? "list";
  const refFilter = params.ref ?? "";
  const typeFilter = params.type ?? "";
  const page    = Number(params.page ?? 1);
  const supabase = createAdminClient();

  // ── Vue groupée par BL ──────────────────────────────────────────
  if (view === "bl") {
    const { data: blData } = await supabase
      .from("stock_movements")
      .select("reference, movement_type, lot_number, created_at, quantity, products(name)")
      .not("reference", "is", null)
      .order("created_at", { ascending: false })
      .limit(200);

    // Grouper par référence
    const groups: Record<string, {
      reference: string; movement_type: string; lot_number: string | null;
      date: string; products: string[]; total_qty: number; line_count: number;
    }> = {};

    for (const m of blData ?? []) {
      const ref = m.reference as string;
      if (!groups[ref]) {
        groups[ref] = {
          reference: ref, movement_type: m.movement_type,
          lot_number: m.lot_number ?? null, date: m.created_at,
          products: [], total_qty: 0, line_count: 0,
        };
      }
      groups[ref].line_count++;
      groups[ref].total_qty += Math.abs(Number(m.quantity));
      const prod = extractRelation<{ name: string }>(m.products);
      if (prod?.name && !groups[ref].products.includes(prod.name)) {
        groups[ref].products.push(prod.name);
      }
    }

    const bls = Object.values(groups).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bons de Livraison</h1>
            <p className="text-sm text-gray-400">{bls.length} BL enregistrés</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/stocks/mouvements" className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Liste</Link>
            <Link href="/admin/stocks/mouvements?view=bl" className="px-3 py-1.5 bg-shifaa-green text-white rounded-xl text-sm">Par BL</Link>
            <Link href="/admin/stocks/mouvement" className="px-4 py-1.5 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark">+ Nouveau BL</Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Référence BL", "Type", "N° Lot", "Produits", "Qté totale", "Lignes", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bls.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucun BL enregistré avec référence</td></tr>
              ) : bls.map((bl) => {
                const tc = TYPE_CONFIG[bl.movement_type] ?? { label: bl.movement_type, color: "bg-gray-100 text-gray-600", icon: "📦", sign: "" };
                return (
                  <tr key={bl.reference} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-3">
                      <Link href={`/admin/stocks/mouvements?ref=${bl.reference}`}
                        className="font-mono font-bold text-shifaa-green hover:underline text-sm">
                        {bl.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}>
                        {tc.icon} {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{bl.lot_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {bl.products.slice(0, 3).map((p) => (
                          <span key={p} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[120px]">{p}</span>
                        ))}
                        {bl.products.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{bl.products.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${["entry","return"].includes(bl.movement_type) ? "text-green-600" : "text-red-600"}`}>
                        {tc.sign}{bl.total_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{bl.line_count} ligne{bl.line_count > 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(bl.date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Vue liste classique ─────────────────────────────────────────
  const limit = 50;
  let query = supabase
    .from("stock_movements")
    .select("*, products(name, brand, sku), warehouses(name, code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (refFilter)  query = query.eq("reference", refFilter);
  if (typeFilter) query = query.eq("movement_type", typeFilter);

  const { data: movements, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mouvements de stock</h1>
          <p className="text-sm text-gray-400">
            {refFilter ? `BL : ${refFilter} · ` : ""}
            {count ?? 0} mouvement{(count ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stocks/mouvements" className="px-3 py-1.5 bg-shifaa-green text-white rounded-xl text-sm">Liste</Link>
          <Link href="/admin/stocks/mouvements?view=bl" className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Par BL</Link>
          <Link href="/admin/stocks/mouvement" className="px-4 py-1.5 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark">+ Nouveau BL</Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: "Tous types", value: "" },
          { label: "📥 Entrées", value: "entry" },
          { label: "📤 Sorties", value: "exit" },
          { label: "⚙️ Ajustements", value: "adjustment" },
          { label: "↩️ Retours", value: "return" },
          { label: "🗑️ Défauts", value: "defect" },
        ].map((f) => (
          <Link key={f.value}
            href={`/admin/stocks/mouvements?type=${f.value}${refFilter ? `&ref=${refFilter}` : ""}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition
              ${typeFilter === f.value ? "bg-shifaa-green text-white border-shifaa-green" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            {f.label}
          </Link>
        ))}
        {refFilter && (
          <Link href="/admin/stocks/mouvements" className="px-3 py-1.5 rounded-xl text-xs border border-red-200 text-red-500 hover:bg-red-50">
            ✕ BL : {refFilter}
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Produit", "Type", "Qté", "Avant → Après", "Référence BL", "Lot", "Entrepôt", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(movements ?? []).length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Aucun mouvement trouvé</td></tr>
              ) : (movements ?? []).map((m) => {
                const prod = extractRelation<{ name: string; brand: string; sku?: string }>(m.products);
                const wh   = extractRelation<{ name: string; code: string }>(m.warehouses);
                const tc   = TYPE_CONFIG[m.movement_type] ?? TYPE_CONFIG.adjustment;
                const qty  = Number(m.quantity);
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs truncate max-w-[180px]">{prod?.name ?? "—"}</p>
                      <p className="text-[10px] text-gray-400">{prod?.brand}{prod?.sku ? ` · ${prod.sku}` : ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tc.color}`}>
                        {tc.icon} {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${qty > 0 ? "text-green-600" : "text-red-600"}`}>
                        {qty > 0 ? "+" : ""}{qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {m.qty_before} → {m.qty_after}
                    </td>
                    <td className="px-4 py-3">
                      {m.reference ? (
                        <Link href={`/admin/stocks/mouvements?ref=${m.reference}`}
                          className="font-mono text-xs text-shifaa-green hover:underline">
                          {m.reference}
                        </Link>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.lot_number ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{wh?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                      <span className="text-gray-300 ml-1">{new Date(m.created_at).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page}/{totalPages} · {count} mouvements</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}&type=${typeFilter}&ref=${refFilter}&view=${view}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">← Précédent</Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}&type=${typeFilter}&ref=${refFilter}&view=${view}`}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">Suivant →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
