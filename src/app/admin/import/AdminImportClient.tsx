"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const IMPORT_TYPES = [
  { type: "products", label: "Produits", icon: "📦", endpoint: "/api/admin/import/products",
    fields: "slug, name, brand, category, price, compare_at_price, stock, description, is_new, is_best_seller",
    template: "/templates/import-produits.csv" },
  { type: "wilayas", label: "Wilayas", icon: "🗺️", endpoint: "/api/admin/import/wilayas",
    fields: "code, fee_home, fee_relay, free_above, delivery_days_home, active",
    template: "/templates/import-wilayas.csv" },
  { type: "carriers", label: "Livreurs", icon: "🚚", endpoint: "/api/admin/import/carriers",
    fields: "name, phone, email, fee_home, fee_relay, zones, active",
    template: "/templates/import-livreurs.csv" },
  { type: "suppliers", label: "Fournisseurs", icon: "🏭", endpoint: "/api/admin/import/suppliers",
    fields: "name, contact_name, phone, email, address, wilaya, payment_terms",
    template: "/templates/import-fournisseurs.csv" },
  { type: "promo_codes", label: "Codes promo", icon: "🎟️", endpoint: "/api/admin/import/promo-codes",
    fields: "code, discount_type, value, min_order, max_uses, expires_at",
    template: "/templates/import-promo-codes.csv" },
  { type: "stock", label: "Stock", icon: "📋", endpoint: "/api/admin/import/stock",
    fields: "slug, stock",
    template: "/templates/import-stock.csv" },
];

type ImportResult = {
  total: number;
  success: number;
  errors: number;
  errorDetails?: Array<{ row: number; error: string }>;
};

export default function AdminImportClient() {
  const [selected, setSelected] = useState(IMPORT_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(selected.endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur import");
      setResult(data);
      router.refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur type */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {IMPORT_TYPES.map((t) => (
          <button key={t.type} onClick={() => { setSelected(t); setFile(null); setResult(null); }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-colors
              ${selected.type === t.type
                ? "border-[#18534F] bg-[#18534F]/5 text-[#18534F]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <span className="text-xl">{t.icon}</span>
            <span className="font-medium text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Zone d'import */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-medium text-gray-900">Import {selected.label}</h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">{selected.fields}</p>
          </div>
          <a href={selected.template} download
            className="text-xs text-[#18534F] hover:underline border border-[#18534F]/20 px-3 py-1.5 rounded-lg">
            📄 Télécharger le modèle CSV
          </a>
        </div>

        {/* Drop zone */}
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
          ${file ? "border-[#18534F] bg-[#18534F]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
          <span className="text-3xl mb-2">{file ? "📄" : "⬆️"}</span>
          {file ? (
            <div className="text-center">
              <p className="font-medium text-[#18534F]">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Glissez votre fichier CSV ici</p>
              <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir</p>
            </div>
          )}
          <input type="file" accept=".csv" className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
        </label>

        {file && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => { setFile(null); setResult(null); }}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              ✕ Annuler
            </button>
            <button onClick={handleImport} disabled={loading}
              className="flex-1 bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin">⟳</span> Import en cours...</>
              ) : (
                <><span>⬆</span> Lancer l&apos;import</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Résultat */}
      {result && (
        <div className={`rounded-xl border p-5 ${result.errors === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <h3 className={`font-medium mb-3 ${result.errors === 0 ? "text-green-800" : "text-amber-800"}`}>
            {result.errors === 0 ? "✅ Import terminé avec succès !" : "⚠ Import terminé avec des avertissements"}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-3">
            <div>
              <p className="text-2xl font-semibold text-gray-900">{result.total}</p>
              <p className="text-xs text-gray-500">Lignes traitées</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-green-600">{result.success}</p>
              <p className="text-xs text-gray-500">Succès</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-500">{result.errors}</p>
              <p className="text-xs text-gray-500">Erreurs</p>
            </div>
          </div>
          {result.errorDetails && result.errorDetails.length > 0 && (
            <div className="mt-3 space-y-1">
              {result.errorDetails.map((e, i) => (
                <p key={i} className="text-xs text-red-600 font-mono">
                  Ligne {e.row} : {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
