"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = { id: string; name: string; brand: string; stock: number };
type Warehouse = { id: string; name: string; code: string };

const MOVEMENT_TYPES = [
  { value: "entry",      label: "Entrée stock",        icon: "📥", hint: "Réception fournisseur, achat" },
  { value: "exit",       label: "Sortie stock",         icon: "📤", hint: "Vente, prélèvement" },
  { value: "adjustment", label: "Ajustement",           icon: "⚙️", hint: "Correction d'inventaire" },
  { value: "return",     label: "Retour client",        icon: "↩️", hint: "Produit retourné et remis en stock" },
  { value: "defect",     label: "Mise en défaut",       icon: "🗑️", hint: "Produit endommagé ou périmé" },
];

export default function NouveauMouvementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    product_id:    "",
    warehouse_id:  "",
    movement_type: "entry",
    quantity:      "",
    reference:     "",
    lot_number:    "",
    notes:         "",
    unit_cost:     "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stocks/produits").then((r) => r.json()),
      fetch("/api/admin/stocks/entrepots").then((r) => r.json()),
    ]).then(([p, w]) => {
      setProducts(p.products ?? []);
      setWarehouses(w.warehouses ?? []);
      if (w.warehouses?.[0]) setForm((f) => ({ ...f, warehouse_id: w.warehouses[0].id }));
    });
  }, []);

  const selectedProduct = products.find((p) => p.id === form.product_id);
  const isExit = ["exit", "defect"].includes(form.movement_type);
  const qty = Number(form.quantity);
  const newStock = selectedProduct
    ? isExit ? selectedProduct.stock - qty : selectedProduct.stock + qty
    : null;

  async function submit() {
    if (!form.product_id || !form.warehouse_id || !form.quantity) {
      setError("Produit, entrepôt et quantité sont obligatoires"); return;
    }
    if (qty <= 0) { setError("La quantité doit être positive"); return; }
    if (isExit && selectedProduct && qty > selectedProduct.stock) {
      setError(`Stock insuffisant : ${selectedProduct.stock} unité(s) disponibles`); return;
    }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/stocks/mouvement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: isExit ? -qty : qty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setSuccess(true);
      setTimeout(() => router.push("/admin/stocks"), 1500);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stocks" className="text-gray-400 hover:text-gray-600">←</Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nouveau mouvement de stock</h1>
          <p className="text-sm text-gray-400">Entrée, sortie, ajustement ou retour</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">✅ Mouvement enregistré avec succès</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Type de mouvement */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Type de mouvement *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MOVEMENT_TYPES.map((t) => (
              <button key={t.value} type="button"
                onClick={() => setForm((f) => ({ ...f, movement_type: t.value }))}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all
                  ${form.movement_type === t.value ? "border-shifaa-green bg-shifaa-green/5 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-semibold text-gray-800">{t.label}</span>
                <span className="text-[10px] text-gray-400">{t.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Produit */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Produit *</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className={inputCls} placeholder="Rechercher un produit…" />
          {search && (
            <div className="mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
              {filteredProducts.slice(0, 8).map((p) => (
                <button key={p.id} type="button"
                  onClick={() => { setForm((f) => ({ ...f, product_id: p.id })); setSearch(p.name); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </div>
                  <span className={`text-xs font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= 10 ? "text-amber-600" : "text-green-600"}`}>
                    {p.stock} unités
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedProduct && (
            <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
              Stock actuel : <strong>{selectedProduct.stock} unités</strong>
              {newStock !== null && (
                <span className="ml-2">→ Après mouvement : <strong className={newStock < 0 ? "text-red-600" : "text-blue-700"}>{newStock} unités</strong></span>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Entrepôt */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Entrepôt *</label>
            <select value={form.warehouse_id} onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))} className={inputCls}>
              <option value="">Sélectionner…</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantité *</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              className={inputCls} min={1} placeholder="0" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Référence */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Référence</label>
            <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              className={inputCls} placeholder="N° BL, commande, facture…" />
          </div>

          {/* Coût unitaire */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Coût unitaire (DZD)</label>
            <input type="number" value={form.unit_cost} onChange={(e) => setForm((f) => ({ ...f, unit_cost: e.target.value }))}
              className={inputCls} min={0} placeholder="0" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* N° lot */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">N° lot</label>
            <input value={form.lot_number} onChange={(e) => setForm((f) => ({ ...f, lot_number: e.target.value }))}
              className={inputCls} placeholder="LOT-2026-001" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2} className={inputCls} placeholder="Commentaire optionnel…" />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Link href="/admin/stocks" className="text-sm text-gray-400 hover:text-gray-600">← Annuler</Link>
        <button onClick={submit} disabled={loading || success}
          className="px-6 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark disabled:opacity-50">
          {loading ? "Enregistrement…" : success ? "✓ Enregistré !" : "Enregistrer le mouvement"}
        </button>
      </div>
    </div>
  );
}
