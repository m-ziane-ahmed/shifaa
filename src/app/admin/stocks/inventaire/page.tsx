import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventaires | Admin Shifaa" };

export default async function InventairePage() {
  const supabase = createAdminClient();

  const { data: sessions } = await supabase
    .from("inventory_sessions")
    .select("*, warehouses(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id, name")
    .eq("is_active", true);

  const statusConfig = {
    planned:     { label: "Planifié",    cls: "bg-blue-100 text-blue-700" },
    in_progress: { label: "En cours",   cls: "bg-amber-100 text-amber-700" },
    completed:   { label: "Terminé",    cls: "bg-green-100 text-green-700" },
    cancelled:   { label: "Annulé",     cls: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Inventaires</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Inventaires</h1>
          <p className="text-sm text-gray-500">Planification et suivi des inventaires physiques</p>
        </div>
        <Link href="/admin/stocks/inventaire/nouveau"
          className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
          + Nouvel inventaire
        </Link>
      </div>

      {/* Comment fonctionne l'inventaire */}
      <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">📋 Comment réaliser un inventaire</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Créer une session d&apos;inventaire pour l&apos;entrepôt souhaité</li>
          <li>Compter physiquement les quantités de chaque produit</li>
          <li>Saisir les quantités comptées dans chaque ligne</li>
          <li>Valider les écarts — les ajustements sont automatiquement appliqués au stock</li>
        </ol>
      </div>

      {/* Liste des sessions */}
      {(sessions ?? []).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-700">Aucun inventaire</p>
          <p className="text-sm text-gray-400 mt-1">Créez votre premier inventaire pour vérifier vos stocks physiques</p>
          <Link href="/admin/stocks/inventaire/nouveau"
            className="mt-4 inline-block px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
            + Créer un inventaire
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Nom", "Entrepôt", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(sessions ?? []).map((s) => {
                const st = statusConfig[s.status as keyof typeof statusConfig] ?? { label: s.status, cls: "bg-gray-100 text-gray-600" };
                const wh = s.warehouses as { name: string } | null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{wh?.name ?? "Tous entrepôts"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("fr-DZ")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/stocks/inventaire/${s.id}`}
                        className="text-xs text-shifaa-green hover:underline">
                        {s.status === "completed" ? "Voir" : "Continuer"} →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Entrepôts disponibles */}
      {(warehouses ?? []).length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Entrepôts disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {(warehouses ?? []).map((w) => (
              <span key={w.id} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                🏭 {w.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
