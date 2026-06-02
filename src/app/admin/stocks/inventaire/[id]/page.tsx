import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function validateAdjustments(sessionId: string) {
  "use server";
  const supabase = createAdminClient();

  // Récupérer les lignes avec écarts
  const { data: lines } = await supabase
    .from("inventory_lines")
    .select("*, products(name)")
    .eq("session_id", sessionId)
    .not("qty_counted", "is", null)
    .neq("qty_diff", 0);

  // Récupérer l'entrepôt de la session
  const { data: session } = await supabase
    .from("inventory_sessions")
    .select("warehouse_id")
    .eq("id", sessionId)
    .single();

  const warehouseId = session?.warehouse_id;

  // Appliquer les ajustements
  for (const line of lines ?? []) {
    if (!line.qty_counted || !warehouseId) continue;
    const diff = (line.qty_counted ?? 0) - line.qty_theoretical;

    // Enregistrer le mouvement d'ajustement
    const { data: ws } = await supabase
      .from("warehouse_stock")
      .select("qty_available")
      .eq("product_id", line.product_id)
      .eq("warehouse_id", warehouseId)
      .maybeSingle();

    const before = ws?.qty_available ?? 0;
    const after = Math.max(0, before + diff);

    await supabase.from("warehouse_stock").upsert({
      product_id: line.product_id,
      warehouse_id: warehouseId,
      qty_available: after,
      updated_at: new Date().toISOString(),
    }, { onConflict: "product_id,warehouse_id,variant_id" });

    await supabase.from("stock_movements").insert({
      product_id: line.product_id,
      warehouse_id: warehouseId,
      movement_type: "adjustment",
      quantity: diff,
      qty_before: before,
      qty_after: after,
      reference: `INV-${sessionId.slice(0, 8)}`,
      notes: `Ajustement inventaire`,
    });

    // Mettre à jour stock global
    await supabase.from("products").update({ stock: after }).eq("id", line.product_id);

    // Valider la ligne
    await supabase.from("inventory_lines").update({ validated: true }).eq("id", line.id);
  }

  // Clôturer la session
  await supabase.from("inventory_sessions").update({
    status: "completed",
    completed_at: new Date().toISOString(),
  }).eq("id", sessionId);

  revalidatePath(`/admin/stocks/inventaire/${sessionId}`);
}

export default async function InventaireDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: session }, { data: lines }] = await Promise.all([
    supabase.from("inventory_sessions").select("*, warehouses(name)").eq("id", id).single(),
    supabase.from("inventory_lines").select("*, products(name, brand, sku)").eq("session_id", id),
  ]);

  if (!session) notFound();

  const wh = session.warehouses as { name: string } | null;
  const totalLines = (lines ?? []).length;
  const counted = (lines ?? []).filter((l) => l.qty_counted !== null).length;
  const ecarts = (lines ?? []).filter((l) => l.qty_counted !== null && l.qty_diff !== 0);
  const validated = (lines ?? []).filter((l) => l.validated).length;

  const canValidate = session.status === "in_progress" && counted > 0 && ecarts.length > 0;
  const validate = validateAdjustments.bind(null, id);

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    planned:     { label: "Planifié",  cls: "bg-blue-100 text-blue-700" },
    in_progress: { label: "En cours",  cls: "bg-amber-100 text-amber-700" },
    completed:   { label: "Terminé",   cls: "bg-green-100 text-green-700" },
    cancelled:   { label: "Annulé",    cls: "bg-gray-100 text-gray-500" },
  };
  const st = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.planned;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span>
            <Link href="/admin/stocks/inventaire" className="hover:text-shifaa-green">Inventaires</Link>
            <span>›</span>
            <span>{session.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {wh?.name ?? "Tous entrepôts"} · Créé le {new Date(session.created_at).toLocaleDateString("fr-DZ")}
          </p>
        </div>
        {canValidate && (
          <form action={validate}>
            <button type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition shadow-sm">
              ✅ Valider les ajustements ({ecarts.length})
            </button>
          </form>
        )}
        {session.status === "completed" && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
            ✅ Inventaire clôturé
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalLines}</p>
          <p className="text-xs text-gray-400">Lignes total</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-700">{counted}</p>
          <p className="text-xs text-blue-400">Comptées</p>
        </div>
        <div className={`rounded-2xl border p-4 ${ecarts.length > 0 ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-2xl font-bold ${ecarts.length > 0 ? "text-amber-700" : "text-gray-400"}`}>{ecarts.length}</p>
          <p className={`text-xs ${ecarts.length > 0 ? "text-amber-400" : "text-gray-300"}`}>Écarts détectés</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-700">{validated}</p>
          <p className="text-xs text-green-400">Lignes validées</p>
        </div>
      </div>

      {/* Tableau lignes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Lignes d&apos;inventaire</h2>
        </div>
        {(lines ?? []).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-gray-400">Aucune ligne d&apos;inventaire</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Produit", "SKU", "Stock théorique", "Stock compté", "Écart", "Statut"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(lines ?? []).map((l) => {
                  const product = l.products as { name: string; brand: string; sku: string } | null;
                  const diff = l.qty_diff ?? 0;
                  return (
                    <tr key={l.id} className={`hover:bg-gray-50 ${l.validated ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-[200px] truncate">{product?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{product?.brand}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{product?.sku ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700">{l.qty_theoretical}</td>
                      <td className="px-4 py-3 text-center">
                        {l.qty_counted !== null ? (
                          <span className={`font-bold ${diff === 0 ? "text-green-600" : "text-amber-600"}`}>
                            {l.qty_counted}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">Non compté</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {l.qty_counted !== null ? (
                          <span className={`font-bold text-sm ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-400"}`}>
                            {diff > 0 ? "+" : ""}{diff}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {l.validated ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Validé</span>
                        ) : l.qty_counted !== null ? (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">En attente</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Non compté</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
