import { createAdminClient } from "@/lib/supabase-server";
import AdminImportClient from "./AdminImportClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Imports CSV | Admin Shifaa" };

export default async function AdminImport() {
  const supabase = createAdminClient();
  const { data: logs } = await supabase
    .from("import_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Imports CSV</h1>
        <p className="text-sm text-gray-500 mt-1">
          Importez des données en masse. Téléchargez le modèle, remplissez-le et uploadez-le.
        </p>
      </div>

      <AdminImportClient />

      {/* Historique */}
      {(logs ?? []).length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Historique des imports</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Fichier</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">✓ Succès</th>
                <th className="px-4 py-3 text-center">✗ Erreurs</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(logs ?? []).map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium capitalize">{l.type}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{l.filename ?? "—"}</td>
                  <td className="px-4 py-3 text-center">{l.total}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{l.success}</td>
                  <td className="px-4 py-3 text-center">
                    {l.errors > 0
                      ? <span className="text-red-500 font-medium">{l.errors}</span>
                      : <span className="text-gray-400">0</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(l.created_at).toLocaleString("fr-DZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
