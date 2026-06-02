"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Warehouse = { id: string; name: string; code: string };
type Product = { id: string; name: string; brand: string; stock: number; sku: string };

export default function NouvelInventairePage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: `Inventaire ${new Date().toLocaleDateString("fr-DZ")}`,
    warehouse_id: "",
    notes: "",
  });

  // Lignes d'inventaire : produit + quantité comptée
  const [lines, setLines] = useState<Array<{ product_id: string; name: string; brand: string; sku: string; qty_theoretical: number; qty_counted: string }>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stocks/entrepots").then((r) => r.json()),
      fetch("/api/admin/stocks/produits").then((r) => r.json()),
    ]).then(([w, p]) => {
      setWarehouses(w.warehouses ?? []);
      setProducts(p.products ?? []);
      if (w.warehouses?.[0]) setForm((f) => ({ ...f, warehouse_id: w.warehouses[0].id }));
      setLoading(false);
    });
  }, []);

  function addAllProducts() {
    setLines(products.map((p) => ({
      product_id: p.id,
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      qty_theoretical: p.stock,
      qty_counted: "",
    })));
  }

  function addProduct(p: Product) {
    if (lines.find((l) => l.product_id === p.id)) return;
    setLines((prev) => [...prev, {
      product_id: p.id,
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      qty_theoretical: p.stock,
      qty_counted: "",
    }]);
  }

  function updateCount(productId: string, val: string) {
    setLines((prev) => prev.map((l) => l.product_id === productId ? { ...l, qty_counted: val } : l));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.product_id !== productId));
  }

  async function save() {
    if (!form.name || !form.warehouse_id) { setError("Nom et entrepôt sont obligatoires"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/stocks/inventaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.push(`/admin/stocks/inventaire/${data.id}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    !lines.find((l) => l.product_id === p.id)
  );

  const totalEcarts = lines.filter((l) => l.qty_counted !== "" && Number(l.qty_counted) !== l.qty_theoretical).length;

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";

  if (loading) return <div className="p-8 text-gray-400 text-center">Chargement…</div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span>
            <Link href="/admin/stocks/inventaire" className="hover:text-shifaa-green">Inventaires</Link>
            <span>›</span>
            <span>Nouvel inventaire</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nouvel inventaire</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stocks/inventaire" className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Annuler
          </Link>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm hover:bg-shifaa-dark disabled:opacity-50">
            {saving ? "Création…" : "Créer l'inventaire"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-3">

        {/* Infos inventaire */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom de la session *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entrepôt *</label>
              <select value={form.warehouse_id} onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))} className={inputCls}>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3} className={inputCls} placeholder="Inventaire annuel, zone A…" />
            </div>
          </div>

          {/* Résumé */}
          {lines.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
              <p className="flex justify-between"><span className="text-gray-400">Lignes</span><span className="font-bold">{lines.length}</span></p>
              <p className="flex justify-between"><span className="text-gray-400">Comptées</span><span className="font-bold text-green-600">{lines.filter((l) => l.qty_counted !== "").length}</span></p>
              {totalEcarts > 0 && (
                <p className="flex justify-between"><span className="text-amber-500">Écarts détectés</span><span className="font-bold text-amber-600">{totalEcarts}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Ajouter des produits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Ajouter des produits</h2>
            <button onClick={addAllProducts}
              className="text-xs text-shifaa-green hover:underline font-medium">
              Tous ({products.length})
            </button>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…" className={`${inputCls} mb-3`} />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filtered.slice(0, 20).map((p) => (
              <button key={p.id} onClick={() => addProduct(p)} type="button"
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition">
                <div>
                  <p className="text-xs font-medium text-gray-800 truncate max-w-[160px]">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-600">{p.stock}</p>
                  <p className="text-[10px] text-gray-400">unités</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && search && (
              <p className="text-sm text-center text-gray-400 py-4">Aucun résultat</p>
            )}
          </div>
        </div>

        {/* Lignes de comptage */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Comptage ({lines.length})</h2>
            {lines.length > 0 && (
              <button onClick={() => setLines([])} className="text-xs text-red-400 hover:text-red-600">Vider</button>
            )}
          </div>
          {lines.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-gray-400">Ajoutez des produits à compter</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {lines.map((l) => {
                const counted = l.qty_counted !== "" ? Number(l.qty_counted) : null;
                const diff = counted !== null ? counted - l.qty_theoretical : null;
                return (
                  <div key={l.product_id} className="flex items-center gap-2 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{l.name}</p>
                      <p className="text-[10px] text-gray-400">Théorique: {l.qty_theoretical}</p>
                    </div>
                    <input type="number" value={l.qty_counted}
                      onChange={(e) => updateCount(l.product_id, e.target.value)}
                      placeholder="0" min={0}
                      className={`w-16 border rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-shifaa-green/50
                        ${diff === null ? "border-gray-200" : diff === 0 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`} />
                    {diff !== null && diff !== 0 && (
                      <span className={`text-[10px] font-bold shrink-0 ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    )}
                    <button onClick={() => removeLine(l.product_id)} className="text-gray-300 hover:text-red-400 text-sm shrink-0">×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
