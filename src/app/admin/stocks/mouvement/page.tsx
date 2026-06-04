"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = { id: string; name: string; brand: string; stock: number; sku?: string };
type Warehouse = { id: string; name: string; code: string };

type BLLine = {
  id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  current_stock: number;
  quantity: string;
  unit_cost: string;
  expiry_date: string;
  notes_line: string;
};

const MOVEMENT_TYPES = [
  { value: "entry",      label: "Entrée",       icon: "📥", hint: "Réception BL fournisseur" },
  { value: "exit",       label: "Sortie",        icon: "📤", hint: "Expédition, prélèvement" },
  { value: "adjustment", label: "Ajustement",   icon: "⚙️",  hint: "Correction inventaire" },
  { value: "return",     label: "Retour",        icon: "↩️", hint: "Retour client en stock" },
  { value: "defect",     label: "Défaut/Périmé", icon: "🗑️", hint: "Produit endommagé ou périmé" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function NouveauMouvementPage() {
  const router   = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [products,   setProducts]   = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  // ── En-tête BL (commun à toutes les lignes) ──
  const [header, setHeader] = useState({
    movement_type: "entry",
    warehouse_id:  "",
    reference:     "",       // N° BL / Facture
    lot_number:    "",       // N° de lot commun
    notes:         "",
  });

  // ── Lignes produits ──
  const [lines, setLines] = useState<BLLine[]>([]);

  // ── Recherche produit ──
  const [search,       setSearch]       = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showDropdown,  setShowDropdown]  = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stocks/produits").then((r) => r.json()),
      fetch("/api/admin/stocks/entrepots").then((r) => r.json()),
    ]).then(([p, w]) => {
      setProducts(p.products ?? []);
      setWarehouses(w.warehouses ?? []);
      if (w.warehouses?.[0]) {
        setHeader((h) => ({ ...h, warehouse_id: w.warehouses[0].id }));
      }
    });
  }, []);

  // Filtrer les produits lors de la recherche
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const q = search.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
    ).slice(0, 8);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  }, [search, products]);

  // Ajouter un produit à la liste
  function addProduct(p: Product) {
    // Éviter les doublons
    if (lines.find((l) => l.product_id === p.id)) {
      setError(`"${p.name}" est déjà dans la liste`);
      setTimeout(() => setError(""), 2000);
      setSearch(""); setShowDropdown(false);
      return;
    }
    setLines((prev) => [...prev, {
      id:             uid(),
      product_id:     p.id,
      product_name:   p.name,
      product_brand:  p.brand,
      current_stock:  p.stock,
      quantity:       "",
      unit_cost:      "",
      expiry_date:    "",
      notes_line:     "",
    }]);
    setSearch(""); setShowDropdown(false);
    setTimeout(() => searchRef.current?.focus(), 100);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLine(id: string, field: keyof BLLine, value: string) {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  const isExit = ["exit", "defect"].includes(header.movement_type);

  // Validation + calcul aperçu stock
  function getLineStatus(line: BLLine) {
    const qty = Number(line.quantity);
    if (!line.quantity || qty <= 0) return { valid: false, msg: "Quantité requise", color: "text-gray-400" };
    if (isExit && qty > line.current_stock) return { valid: false, msg: `Stock insuf. (${line.current_stock})`, color: "text-red-600" };
    const newStock = isExit ? line.current_stock - qty : line.current_stock + qty;
    return { valid: true, msg: `→ ${newStock} unités`, color: newStock <= 5 ? "text-amber-600" : "text-green-600" };
  }

  const totalLines    = lines.length;
  const validLines    = lines.filter((l) => getLineStatus(l).valid).length;
  const totalQty      = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  async function submit() {
    setError("");
    if (!header.warehouse_id)  { setError("Entrepôt obligatoire"); return; }
    if (!header.reference)     { setError("Référence BL/Facture obligatoire"); return; }
    if (lines.length === 0)    { setError("Ajoutez au moins un produit"); return; }

    const invalids = lines.filter((l) => !getLineStatus(l).valid);
    if (invalids.length > 0) {
      setError(`${invalids.length} ligne(s) avec erreur : vérifiez les quantités`);
      return;
    }

    setSaving(true);
    try {
      // Envoyer chaque ligne comme un mouvement séparé avec la même référence
      const results = await Promise.all(
        lines.map((line) =>
          fetch("/api/admin/stocks/mouvement", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              product_id:    line.product_id,
              warehouse_id:  header.warehouse_id,
              movement_type: header.movement_type,
              quantity:      isExit ? -Number(line.quantity) : Number(line.quantity),
              reference:     header.reference,
              lot_number:    header.lot_number || null,
              expiry_date:   line.expiry_date  || null,
              unit_cost:     line.unit_cost     || null,
              notes:         [header.notes, line.notes_line].filter(Boolean).join(" | ") || null,
            }),
          }).then((r) => r.json())
        )
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        setError(`${errors.length} ligne(s) en erreur : ${errors[0].error}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/stocks/mouvements"), 1800);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/stocks" className="text-gray-400 hover:text-gray-600 text-sm">← Stocks</Link>
          <span className="text-gray-300">/</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saisie de mouvement BL</h1>
            <p className="text-sm text-gray-400">Référence unique · Lot commun · Multi-produits</p>
          </div>
        </div>
        {/* Résumé */}
        {lines.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="text-gray-400">{validLines}/{totalLines} lignes valides</span>
            <span className={`font-semibold ${isExit ? "text-red-600" : "text-green-600"}`}>
              {isExit ? "−" : "+"}{totalQty} unités
            </span>
          </div>
        )}
      </div>

      {error   && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">⚠️ {error}</div>}
      {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">✅ {totalLines} ligne(s) enregistrée(s) avec succès — redirection…</div>}

      {/* ── Section 1 : En-tête BL ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-shifaa-green text-white text-xs flex items-center justify-center font-bold">1</span>
          En-tête du Bon de Livraison
        </h2>

        {/* Type de mouvement */}
        <div className="mb-4">
          <label className={labelCls}>Type de mouvement *</label>
          <div className="flex flex-wrap gap-2">
            {MOVEMENT_TYPES.map((t) => (
              <button key={t.value} type="button"
                onClick={() => setHeader((h) => ({ ...h, movement_type: t.value }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
                  ${header.movement_type === t.value
                    ? "border-shifaa-green bg-shifaa-green/5 text-shifaa-green font-semibold shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Entrepôt */}
          <div>
            <label className={labelCls}>Entrepôt *</label>
            <select value={header.warehouse_id}
              onChange={(e) => setHeader((h) => ({ ...h, warehouse_id: e.target.value }))}
              className={inputCls}>
              <option value="">Sélectionner…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          {/* Référence BL */}
          <div>
            <label className={labelCls}>Référence BL / Facture *</label>
            <input value={header.reference}
              onChange={(e) => setHeader((h) => ({ ...h, reference: e.target.value }))}
              className={inputCls} placeholder="BL-2026-0001, FAC-xxx…" />
          </div>

          {/* N° lot commun */}
          <div>
            <label className={labelCls}>N° lot commun</label>
            <input value={header.lot_number}
              onChange={(e) => setHeader((h) => ({ ...h, lot_number: e.target.value }))}
              className={inputCls} placeholder="LOT-2026-001" />
          </div>

          {/* Notes BL */}
          <div>
            <label className={labelCls}>Notes générales</label>
            <input value={header.notes}
              onChange={(e) => setHeader((h) => ({ ...h, notes: e.target.value }))}
              className={inputCls} placeholder="Fournisseur, remarque…" />
          </div>
        </div>
      </div>

      {/* ── Section 2 : Lignes produits ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-shifaa-green text-white text-xs flex items-center justify-center font-bold">2</span>
            Lignes produits
            {lines.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-shifaa-green/10 text-shifaa-green text-xs rounded-full font-medium">
                {lines.length} produit{lines.length > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          {lines.length > 0 && (
            <button onClick={() => setLines([])} className="text-xs text-red-400 hover:text-red-600">
              Vider la liste
            </button>
          )}
        </div>

        {/* Barre de recherche produit */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Rechercher un produit par nom, marque ou SKU… (↵ pour ajouter)"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white"
            />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onMouseDown={() => addProduct(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-shifaa-green/5 transition text-left border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</p>
                    </div>
                    <div className="shrink-0 text-right ml-3">
                      <p className={`text-xs font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
                        {p.stock} unités
                      </p>
                      <p className="text-[10px] text-gray-300">en stock</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
            Tapez pour rechercher et cliquez pour ajouter. Les doublons sont détectés automatiquement.
          </p>
        </div>

        {/* Table des lignes */}
        {lines.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm font-medium text-gray-700 mb-1">Aucun produit ajouté</p>
            <p className="text-xs text-gray-400">Utilisez la barre de recherche ci-dessus pour ajouter des produits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 min-w-[200px]">Produit</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500">Stock actuel</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 min-w-[90px]">Quantité *</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 min-w-[100px]">Coût unit. DZD</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 min-w-[120px]">Date péremption</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 min-w-[140px]">Note ligne</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500">Résultat</th>
                  <th className="px-2 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lines.map((line, idx) => {
                  const status = getLineStatus(line);
                  return (
                    <tr key={line.id} className={`hover:bg-gray-50/50 transition ${!status.valid && line.quantity ? "bg-red-50/30" : ""}`}>
                      {/* Produit */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-300 font-mono w-4">{idx + 1}</span>
                          <div>
                            <p className="font-medium text-gray-800 text-xs leading-tight">{line.product_name}</p>
                            <p className="text-[10px] text-gray-400">{line.product_brand}</p>
                          </div>
                        </div>
                      </td>
                      {/* Stock actuel */}
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold ${
                          line.current_stock === 0 ? "text-red-600" :
                          line.current_stock <= 5  ? "text-amber-600" : "text-gray-600"
                        }`}>
                          {line.current_stock}
                        </span>
                      </td>
                      {/* Quantité */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number" min={1}
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                          placeholder="0"
                          className={`w-20 border rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 transition
                            ${!status.valid && line.quantity
                              ? "border-red-300 bg-red-50 focus:ring-red-300"
                              : "border-gray-200 focus:ring-shifaa-green/40"
                            }`}
                        />
                      </td>
                      {/* Coût unitaire */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number" min={0}
                          value={line.unit_cost}
                          onChange={(e) => updateLine(line.id, "unit_cost", e.target.value)}
                          placeholder="0"
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-shifaa-green/40"
                        />
                      </td>
                      {/* Date péremption */}
                      <td className="px-3 py-2.5">
                        <input
                          type="date"
                          value={line.expiry_date}
                          onChange={(e) => updateLine(line.id, "expiry_date", e.target.value)}
                          className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-shifaa-green/40"
                        />
                      </td>
                      {/* Note ligne */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={line.notes_line}
                          onChange={(e) => updateLine(line.id, "notes_line", e.target.value)}
                          placeholder="Remarque…"
                          className="w-36 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-shifaa-green/40"
                        />
                      </td>
                      {/* Résultat */}
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-medium whitespace-nowrap ${status.color}`}>
                          {line.quantity ? status.msg : "—"}
                        </span>
                      </td>
                      {/* Supprimer */}
                      <td className="px-2 py-2.5">
                        <button onClick={() => removeLine(line.id)}
                          className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
                          title="Supprimer cette ligne">
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Pied de table récapitulatif */}
              {lines.length > 1 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-600" colSpan={2}>
                      Total — {lines.length} produit{lines.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-sm font-bold ${isExit ? "text-red-600" : "text-shifaa-green"}`}>
                        {isExit ? "−" : "+"}{totalQty}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {lines.some((l) => l.unit_cost) && (
                        <span className="text-xs font-semibold text-gray-600">
                          {new Intl.NumberFormat("fr-DZ").format(
                            lines.reduce((s, l) => s + (Number(l.unit_cost) || 0) * (Number(l.quantity) || 0), 0)
                          )} DZD
                        </span>
                      )}
                    </td>
                    <td colSpan={4} className="px-3 py-2.5">
                      <span className={`text-xs ${validLines === lines.length ? "text-green-600" : "text-amber-600"}`}>
                        {validLines === lines.length
                          ? `✓ Toutes les lignes sont valides`
                          : `⚠ ${lines.length - validLines} ligne(s) à corriger`}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between">
        <Link href="/admin/stocks" className="text-sm text-gray-400 hover:text-gray-600">
          ← Annuler
        </Link>
        <div className="flex items-center gap-3">
          {lines.length > 0 && (
            <div className="text-xs text-gray-400 text-right">
              <p>{validLines}/{totalLines} lignes prêtes</p>
              <p>Réf. {header.reference || "—"} · {header.lot_number || "Pas de lot"}</p>
            </div>
          )}
          <button
            onClick={submit}
            disabled={saving || success || lines.length === 0 || !header.reference || !header.warehouse_id}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm
              ${saving || success || lines.length === 0 || !header.reference || !header.warehouse_id
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-shifaa-green text-white hover:bg-shifaa-dark"
              }`}>
            {saving  ? "Enregistrement…" :
             success ? "✓ Enregistré !" :
             lines.length === 0
               ? "Ajoutez des produits"
               : `Enregistrer le BL (${lines.length} ligne${lines.length > 1 ? "s" : ""})`}
          </button>
        </div>
      </div>
    </div>
  );
}
