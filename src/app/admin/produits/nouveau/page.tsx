"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS } from "@/data/categories";

const NEEDS = ["hydratation","anti-âge","purification","apaisement","fortification","protection solaire","nutrition","détente","hygiène","soin bébé"];
const SKIN_TYPES = ["Normale","Sèche","Grasse","Mixte","Sensible","Acnéique","Mature"];
const AGE_GROUPS = ["Tous âges","Bébé 0-3 ans","Enfant","Adolescent","18-25 ans","26-40 ans","40+ ans","Senior"];

type FormData = {
  name: string; brand: string; slug: string; sku: string; category: string; subcategory: string;
  short_description: string; description: string; ingredients: string; usage: string;
  precautions: string; benefits: string; active_ingredients: string;
  price: string; compare_at_price: string; cost_price: string;
  stock: string; weight_grams: string; barcode: string;
  need: string; skin_type: string[]; age_group: string; gender: string;
  is_new: boolean; is_best_seller: boolean; is_active: boolean;
  is_bio: boolean; is_vegan: boolean; is_sans_parfum: boolean; is_sans_parabene: boolean;
  meta_title: string; meta_description: string;
  status: string;
};

const DEFAULT: FormData = {
  name: "", brand: "", slug: "", sku: "", category: "", subcategory: "",
  short_description: "", description: "", ingredients: "", usage: "",
  precautions: "", benefits: "", active_ingredients: "",
  price: "", compare_at_price: "", cost_price: "",
  stock: "0", weight_grams: "", barcode: "",
  need: "", skin_type: [], age_group: "", gender: "",
  is_new: false, is_best_seller: false, is_active: true,
  is_bio: false, is_vegan: false, is_sans_parfum: false, is_sans_parabene: false,
  meta_title: "", meta_description: "",
  status: "draft",
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NouveauProduitPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(DEFAULT);
  const [tab, setTab] = useState<"general"|"contenu"|"stock"|"seo"|"tags">("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function set(key: keyof FormData, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && !form.slug) {
      setForm((f) => ({ ...f, name: value as string, slug: slugify(value as string) }));
    }
  }

  async function save(status: "draft" | "published") {
    setSaving(true); setError("");
    try {
      const body = {
        ...form,
        status,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        stock: Number(form.stock),
        weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
        benefits: form.benefits.split("\n").filter(Boolean),
        active_ingredients: form.active_ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch("/api/admin/produits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      startTransition(() => router.push(`/admin/produits/${data.id}`));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  const TABS = [
    { id: "general", label: "Général" },
    { id: "contenu", label: "Contenu" },
    { id: "stock", label: "Prix & Stock" },
    { id: "seo", label: "SEO" },
    { id: "tags", label: "Tags & Filtres" },
  ] as const;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nouveau produit</h1>
          <p className="text-sm text-gray-500 mt-0.5">Remplissez les informations du produit</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save("draft")} disabled={saving}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Enregistrer brouillon
          </button>
          <button onClick={() => save("published")} disabled={saving}
            className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark disabled:opacity-50">
            {saving ? "Enregistrement…" : "Publier"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${tab === t.id ? "bg-white border border-b-white border-gray-200 text-shifaa-green -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* ── GÉNÉRAL ── */}
        {tab === "general" && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nom du produit *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Ex: Crème Hydratante Avène 50ml" />
            </div>
            <div>
              <label className={labelCls}>Marque *</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} placeholder="Ex: Avène" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Slug URL *</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} placeholder="creme-hydratante-avene-50ml" />
            </div>
            <div>
              <label className={labelCls}>SKU / Référence</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} placeholder="AVE-CH-50ML" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Catégorie *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut publication</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Description courte *</label>
            <textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)}
              rows={2} className={inputCls} placeholder="1-2 phrases de présentation du produit" />
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {(["is_active","is_new","is_best_seller","is_bio","is_vegan","is_sans_parfum","is_sans_parabene"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[key] as boolean} onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 accent-shifaa-green" />
                {key === "is_active" ? "Actif" : key === "is_new" ? "Nouveau" : key === "is_best_seller" ? "Best-seller" :
                  key === "is_bio" ? "Bio" : key === "is_vegan" ? "Vegan" : key === "is_sans_parfum" ? "Sans parfum" : "Sans parabène"}
              </label>
            ))}
          </div>
        </>)}

        {/* ── CONTENU ── */}
        {tab === "contenu" && (<>
          <div>
            <label className={labelCls}>Description complète</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={6} className={inputCls} placeholder="Description détaillée du produit, bénéfices, particularités…" />
          </div>
          <div>
            <label className={labelCls}>Bénéfices (un par ligne)</label>
            <textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)}
              rows={4} className={inputCls} placeholder={"Hydrate intensément pendant 24h\nRenforce la barrière cutanée\nConvient aux peaux sensibles"} />
          </div>
          <div>
            <label className={labelCls}>Mode d&apos;utilisation</label>
            <textarea value={form.usage} onChange={(e) => set("usage", e.target.value)}
              rows={3} className={inputCls} placeholder="Appliquez matin et soir sur peau propre et sèche…" />
          </div>
          <div>
            <label className={labelCls}>Précautions d&apos;emploi</label>
            <textarea value={form.precautions} onChange={(e) => set("precautions", e.target.value)}
              rows={2} className={inputCls} placeholder="Tenir hors de portée des enfants…" />
          </div>
          <div>
            <label className={labelCls}>Composition / Ingrédients (INCI)</label>
            <textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)}
              rows={3} className={inputCls} placeholder="Aqua, Glycerin, Paraffinum Liquidum…" />
          </div>
          <div>
            <label className={labelCls}>Ingrédients actifs clés (séparés par virgule)</label>
            <input value={form.active_ingredients} onChange={(e) => set("active_ingredients", e.target.value)}
              className={inputCls} placeholder="Acide hyaluronique, Niacinamide, Vitamine C" />
          </div>
        </>)}

        {/* ── PRIX & STOCK ── */}
        {tab === "stock" && (<>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Prix de vente (DZD) *</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} min={0} placeholder="2500" />
            </div>
            <div>
              <label className={labelCls}>Prix barré (DZD)</label>
              <input type="number" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} className={inputCls} min={0} placeholder="3000" />
            </div>
            <div>
              <label className={labelCls}>Prix d&apos;achat (DZD)</label>
              <input type="number" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} className={inputCls} min={0} placeholder="1200" />
              {form.cost_price && form.price && (
                <p className="text-xs text-shifaa-green mt-1">
                  Marge : {Math.round(((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100)}%
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Stock initial *</label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Poids (grammes)</label>
              <input type="number" value={form.weight_grams} onChange={(e) => set("weight_grams", e.target.value)} className={inputCls} min={0} placeholder="250" />
            </div>
            <div>
              <label className={labelCls}>Code-barres / EAN</label>
              <input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} className={inputCls} placeholder="3401399671491" />
            </div>
          </div>
        </>)}

        {/* ── SEO ── */}
        {tab === "seo" && (<>
          <div>
            <label className={labelCls}>Titre SEO (meta title)</label>
            <input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={inputCls}
              placeholder="Crème Hydratante Avène 50ml — Peau Sèche | Shifaa" maxLength={70} />
            <p className="text-xs text-gray-400 mt-1">{form.meta_title.length}/70 caractères</p>
          </div>
          <div>
            <label className={labelCls}>Meta description</label>
            <textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)}
              rows={3} className={inputCls} maxLength={160}
              placeholder="Crème hydratante ultra-douce Avène pour peau sèche et sensible. Soulage les tiraillements et renforce la barrière cutanée. Livraison rapide en Algérie." />
            <p className="text-xs text-gray-400 mt-1">{form.meta_description.length}/160 caractères</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Aperçu Google</p>
            <p className="text-blue-600 text-sm truncate">{form.meta_title || form.name || "Titre du produit"}</p>
            <p className="text-green-700 text-xs">shifaa.dz/produit/{form.slug || "url-produit"}</p>
            <p className="text-gray-600 text-xs line-clamp-2">{form.meta_description || form.short_description || "Description du produit…"}</p>
          </div>
        </>)}

        {/* ── TAGS & FILTRES ── */}
        {tab === "tags" && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Besoin principal</label>
              <select value={form.need} onChange={(e) => set("need", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Âge cible</label>
              <select value={form.age_group} onChange={(e) => set("age_group", e.target.value)} className={inputCls}>
                <option value="">Tous âges</option>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Types de peau</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SKIN_TYPES.map((s) => (
                <label key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs cursor-pointer border transition-colors
                  ${form.skin_type.includes(s) ? "bg-shifaa-green/10 border-shifaa-green text-shifaa-green font-medium" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                  <input type="checkbox" className="sr-only"
                    checked={form.skin_type.includes(s)}
                    onChange={(e) => set("skin_type", e.target.checked ? [...form.skin_type, s] : form.skin_type.filter((x) => x !== s))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Genre cible</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
              <option value="">Tous</option>
              <option value="femme">Femme</option>
              <option value="homme">Homme</option>
              <option value="mixte">Mixte</option>
              <option value="bebe">Bébé</option>
            </select>
          </div>
        </>)}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between mt-4">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Annuler</button>
        <div className="flex gap-2">
          <button onClick={() => save("draft")} disabled={saving}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Brouillon
          </button>
          <button onClick={() => save("published")} disabled={saving}
            className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark disabled:opacity-50">
            {saving ? "…" : "Publier le produit"}
          </button>
        </div>
      </div>
    </div>
  );
}
