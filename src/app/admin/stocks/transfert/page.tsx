"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Warehouse = { id: string; name: string; code: string };
type Product = { id: string; name: string; brand: string; stock: number };

export default function TransfertStockPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    from_warehouse: "", to_warehouse: "", notes: "",
  });
  const [lines, setLines] = useState<Array<{ product_id: string; name: string; brand: string; stock: number; qty: string }>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stocks/entrepots").then((r) => r.json()),
      fetch("/api/admin/stocks/produits").then((r) => r.json()),
    ]).then(([w, p]) => {
      setWarehouses(w.warehouses ?? []);
      setProducts(p.products ?? []);
      if (w.warehouses?.length >= 2) {
        setForm((f) => ({ ...f, from_warehouse: w.warehouses[0].id, to_warehouse: w.warehouses[1].id }));
      }
    });
  }, []);

  function addProduct(p: Product) {
    if (lines.find((l) => l.product_id === p.id)) return;
    setLines((prev) => [...prev, { product_id: p.id, name: p.name, brand: p.brand, stock: p.stock, qty: "" }]);
    setSearch("");
  }

  async function save() {
    if (!form.from_warehouse || !form.to_warehouse) { setError("Sélectionnez les deux entrepôts"); return; }
    if (form.from_warehouse === form.to_warehouse) { setError("Les entrepôts doivent être différents"); return; }
    if (lines.length === 0) { setError("Ajoutez au moins un produit"); return; }
    if (lines.some((l) => !l.qty || Number(l.qty) <= 0)) { setError("Toutes les quantités doivent être renseignées"); return; }

    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/stocks/transfert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lines: lines.map((l) => ({ product_id: l.product_id, qty: Number(l.qty) })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.push("/admin/stocks");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) && !lines.find((l) => l.product_id === p.id)
  );

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin/stocks" className="hover:text-shifaa-green">Stocks</Link>
            <span>›</span><span>Transfert</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Transfert de stock</h1>
          <p className="text-sm text-gray-400">Déplacer des produits entre entrepôts</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/stocks" className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</Link>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark disabled:opacity-50">
            {saving ? "Transfert…" : "🔄 Valider le transfert"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Entrepôts source → destination */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">📤 Entrepôt source</label>
            <select value={form.from_warehouse} onChange={(e) => setForm((f) => ({ ...f, from_warehouse: e.target.value }))}
              className={`${inputCls} w-full`}>
              <option value="">Sélectionner…</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <div className="text-2xl text-gray-300 mt-4">→</div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">📥 Entrepôt destination</label>
            <select value={form.to_warehouse} onChange={(e) => setForm((f) => ({ ...f, to_warehouse: e.target.value }))}
              className={`${inputCls} w-full`}>
              <option value="">Sélectionner…</option>
              {warehouses.filter((w) => w.id !== form.from_warehouse).map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={`${inputCls} w-full`} placeholder="Raison du transfert…" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recherche produits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Ajouter des produits</h2>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-full mb-3`} placeholder="Rechercher…" />
          <div className="max-h-72 overflow-y-auto space-y-1">
            {search && filtered.slice(0, 15).map((p) => (
              <button key={p.id} onClick={() => addProduct(p)} type="button"
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-left">
                <div>
                  <p className="text-xs font-medium text-gray-800 truncate max-w-[180px]">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.brand}</p>
                </div>
                <span className={`text-xs font-bold ${p.stock === 0 ? "text-red-500" : "text-gray-600"}`}>{p.stock}</span>
              </button>
            ))}
            {search && filtered.length === 0 && <p className="text-sm text-center text-gray-400 py-4">Aucun résultat</p>}
            {!search && <p className="text-sm text-center text-gray-300 py-4">Tapez pour chercher un produit</p>}
          </div>
        </div>

        {/* Lignes de transfert */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Produits à transférer ({lines.length})</h2>
          </div>
          {lines.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-gray-400">Recherchez et ajoutez des produits</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {lines.map((l) => (
                <div key={l.product_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{l.name}</p>
                    <p className="text-[10px] text-gray-400">Stock dispo: {l.stock}</p>
                  </div>
                  <input type="number" value={l.qty}
                    onChange={(e) => setLines((prev) => prev.map((x) => x.product_id === l.product_id ? { ...x, qty: e.target.value } : x))}
                    placeholder="Qté" min={1} max={l.stock}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-shifaa-green/50" />
                  <button onClick={() => setLines((p) => p.filter((x) => x.product_id !== l.product_id))}
                    className="text-gray-300 hover:text-red-400 text-sm">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
