"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Save } from "lucide-react";

type Variant = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  stock: string;
  attributes: Record<string, string>;
  is_active: boolean;
  isNew?: boolean;
};

const ATTRIBUTE_KEYS = ["Taille", "Volume", "Couleur", "Parfum", "Format"];

export default function VariantesPage() {
  const params = useParams();
  const productId = params.id as string;

  const [productName, setProductName] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Charger le produit et ses variantes
    Promise.all([
      fetch(`/api/admin/produits/${productId}`).then((r) => r.json()),
      fetch(`/api/admin/produits/${productId}/variantes`).then((r) => r.json()),
    ]).then(([prod, vars]) => {
      setProductName(prod.product?.name ?? "Produit");
      setVariants(vars.variants ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  function addVariant() {
    setVariants((v) => [...v, {
      sku: "", name: "", price: "", stock: "0",
      attributes: {}, is_active: true, isNew: true,
    }]);
  }

  function updateVariant(index: number, key: keyof Variant, value: unknown) {
    setVariants((v) => v.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }

  function updateAttribute(index: number, attrKey: string, attrValue: string) {
    setVariants((v) => v.map((item, i) => i === index
      ? { ...item, attributes: { ...item.attributes, [attrKey]: attrValue } }
      : item
    ));
  }

  async function saveVariant(index: number) {
    const variant = variants[index];
    setSaving(String(index)); setError("");
    try {
      const body = {
        ...variant,
        price: variant.price ? Number(variant.price) : null,
        stock: Number(variant.stock),
        product_id: productId,
      };
      const method = variant.isNew || !variant.id ? "POST" : "PATCH";
      const url = variant.isNew || !variant.id
        ? `/api/admin/produits/${productId}/variantes`
        : `/api/admin/produits/${productId}/variantes/${variant.id}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.id) {
        setVariants((v) => v.map((item, i) => i === index ? { ...item, id: data.id, isNew: false } : item));
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function deleteVariant(index: number) {
    const variant = variants[index];
    if (variant.isNew || !variant.id) {
      setVariants((v) => v.filter((_, i) => i !== index));
      return;
    }
    if (!confirm("Supprimer cette variante ?")) return;
    await fetch(`/api/admin/produits/${productId}/variantes/${variant.id}`, { method: "DELETE" });
    setVariants((v) => v.filter((_, i) => i !== index));
  }

  const inputCls = "border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white w-full";

  if (loading) return <div className="p-8 text-gray-400">Chargement…</div>;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/produits" className="hover:text-shifaa-green">Produits</Link>
            <span>›</span>
            <Link href={`/admin/produits/${productId}`} className="hover:text-shifaa-green">{productName}</Link>
            <span>›</span>
            <span>Variantes</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Gestion des variantes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{variants.length} variante{variants.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/produits/${productId}`}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            ← Retour
          </Link>
          <button onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
            <Plus className="h-4 w-4" />
            Ajouter une variante
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {variants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium text-gray-700">Aucune variante</p>
          <p className="text-sm text-gray-400 mt-1">Ajoutez des variantes pour ce produit (taille, volume, couleur…)</p>
          <button onClick={addVariant}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
            <Plus className="h-4 w-4" />
            Créer la première variante
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id ?? index}
              className={`bg-white rounded-xl border p-5 ${variant.isNew ? "border-shifaa-green/40 shadow-md" : "border-gray-200"}`}>

              {/* Titre variante */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Variante {index + 1}</span>
                  {variant.isNew && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Nouveau</span>}
                  {!variant.is_active && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inactif</span>}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={variant.is_active}
                      onChange={(e) => updateVariant(index, "is_active", e.target.checked)}
                      className="accent-shifaa-green" />
                    Actif
                  </label>
                  <button onClick={() => saveVariant(index)} disabled={saving === String(index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-shifaa-green text-white rounded-lg text-xs hover:bg-shifaa-dark disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" />
                    {saving === String(index) ? "…" : "Sauvegarder"}
                  </button>
                  <button onClick={() => deleteVariant(index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Champs principaux */}
              <div className="grid gap-3 sm:grid-cols-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom variante *</label>
                  <input value={variant.name} onChange={(e) => updateVariant(index, "name", e.target.value)}
                    className={inputCls} placeholder="Ex: 50ml Rose" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU *</label>
                  <input value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    className={inputCls} placeholder="PRD-VAR-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix (DZD)</label>
                  <input type="number" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)}
                    className={inputCls} placeholder="2500" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                  <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)}
                    className={inputCls} min={0} />
                </div>
              </div>

              {/* Attributs */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Attributs de la variante</label>
                <div className="grid gap-2 sm:grid-cols-5">
                  {ATTRIBUTE_KEYS.map((key) => (
                    <div key={key}>
                      <label className="block text-[10px] text-gray-400 mb-1">{key}</label>
                      <input
                        value={variant.attributes[key] ?? ""}
                        onChange={(e) => updateAttribute(index, key, e.target.value)}
                        className={inputCls}
                        placeholder={key === "Volume" ? "50ml" : key === "Taille" ? "S/M/L" : "…"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button onClick={addVariant}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-shifaa-green hover:text-shifaa-green transition-colors">
            <Plus className="h-4 w-4" />
            Ajouter une autre variante
          </button>
        </div>
      )}
    </div>
  );
}
