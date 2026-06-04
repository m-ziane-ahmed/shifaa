"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/data/categories";

const NEEDS = ["hydratation","anti-âge","purification","apaisement","fortification","protection solaire","nutrition","détente","hygiène","soin bébé"];
const SKIN_TYPES = ["Normale","Sèche","Grasse","Mixte","Sensible","Acnéique","Mature"];
const AGE_GROUPS = ["Tous âges","Bébé 0-3 ans","Enfant","Adolescent","18-25 ans","26-40 ans","40+ ans","Senior"];

type Product = Record<string, unknown>;
type Fournisseur = { id: string; name: string };

export function EditProduitClient({ product, fournisseurs }: { product: Product; fournisseurs: Fournisseur[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"general"|"bilingue"|"contenu"|"reglementaire"|"stock"|"seo"|"tags">("general");
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, startTransition] = useTransition();

  const [form, setForm] = useState({
    // Identité FR
    name:               (product.name as string) ?? "",
    brand:              (product.brand as string) ?? "",
    slug:               (product.slug as string) ?? "",
    sku:                (product.sku as string) ?? "",
    category:           (product.category as string) ?? "",
    subcategory:        (product.subcategory as string) ?? "",
    status:             (product.status as string) ?? "draft",
    supplier_id:        (product.supplier_id as string) ?? "",
    // Contenu FR
    short_description:  (product.short_description as string) ?? "",
    description:        (product.description as string) ?? "",
    ingredients:        (product.ingredients as string) ?? "",
    usage:              (product.usage as string) ?? "",
    precautions:        (product.precautions as string) ?? "",
    benefits:           ((product.benefits as string[]) ?? []).join("\n"),
    active_ingredients: ((product.active_ingredients as string[]) ?? []).join(", "),
    // Bilingue AR (V4)
    name_ar:            (product.name_ar as string) ?? "",
    slug_ar:            (product.slug_ar as string) ?? "",
    short_desc_ar:      (product.short_desc_ar as string) ?? "",
    description_ar:     (product.description_ar as string) ?? "",
    ingredients_ar:     (product.ingredients_ar as string) ?? "",
    usage_ar:           (product.usage_ar as string) ?? "",
    precautions_ar:     (product.precautions_ar as string) ?? "",
    meta_title_ar:      (product.meta_title_ar as string) ?? "",
    meta_desc_ar:       (product.meta_desc_ar as string) ?? "",
    // Prix & Stock
    price:              String(product.price ?? ""),
    compare_at_price:   String(product.compare_at_price ?? ""),
    cost_price:         String(product.cost_price ?? ""),
    price_ht:           String(product.price_ht ?? ""),
    tva_rate:           String(product.tva_rate ?? "19"),
    stock:              String(product.stock ?? 0),
    weight_grams:       String(product.weight_grams ?? ""),
    barcode:            (product.barcode as string) ?? "",
    barcode_ean:        (product.barcode_ean as string) ?? "",
    // Réglementaire (V4)
    allergens:          ((product.allergens as string[]) ?? []).join(", "),
    conservation_conditions: (product.conservation_conditions as string) ?? "",
    has_expiry:         (product.has_expiry as boolean) ?? false,
    requires_lot:       (product.requires_lot as boolean) ?? false,
    compliance_note:    (product.compliance_note as string) ?? "",
    regulatory_category: (product.regulatory_category as string) ?? "",
    // SEO FR
    meta_title:         (product.meta_title as string) ?? "",
    meta_description:   (product.meta_description as string) ?? "",
    // Tags & Filtres
    need:               (product.need as string) ?? "",
    skin_type:          (product.skin_type as string[]) ?? [],
    age_group:          (product.age_group as string) ?? "",
    gender:             (product.gender as string) ?? "",
    // Badges
    is_new:             (product.is_new as boolean) ?? false,
    is_best_seller:     (product.is_best_seller as boolean) ?? false,
    is_active:          (product.is_active as boolean) ?? false,
    is_bio:             (product.is_bio as boolean) ?? false,
    is_vegan:           (product.is_vegan as boolean) ?? false,
    is_sans_parfum:     (product.is_sans_parfum as boolean) ?? false,
    is_sans_parabene:   (product.is_sans_parabene as boolean) ?? false,
  });

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Auto-calcul prix HT depuis TTC
  function handlePriceTTC(val: string) {
    set("price", val);
    const tva = Number(form.tva_rate) || 19;
    const ht = Number(val) / (1 + tva / 100);
    if (!isNaN(ht) && ht > 0) set("price_ht", ht.toFixed(2));
  }

  function handleTvaChange(val: string) {
    set("tva_rate", val);
    if (form.price) {
      const ht = Number(form.price) / (1 + Number(val) / 100);
      if (!isNaN(ht) && ht > 0) set("price_ht", ht.toFixed(2));
    }
  }

  async function save() {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const body = {
        ...form,
        price:             Number(form.price),
        compare_at_price:  form.compare_at_price  ? Number(form.compare_at_price)  : null,
        cost_price:        form.cost_price         ? Number(form.cost_price)         : null,
        price_ht:          form.price_ht           ? Number(form.price_ht)           : null,
        tva_rate:          Number(form.tva_rate)   || 19,
        stock:             Number(form.stock),
        weight_grams:      form.weight_grams       ? Number(form.weight_grams)       : null,
        benefits:          form.benefits.split("\n").filter(Boolean),
        active_ingredients:form.active_ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        allergens:         form.allergens.split(",").map((s) => s.trim()).filter(Boolean),
        is_active:         form.status === "published",
        supplier_id:       form.supplier_id || null,
        barcode_ean:       form.barcode_ean || null,
      };
      const res = await fetch(`/api/admin/produits/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la mise à jour");
      setSuccess(true);
      setTimeout(() => startTransition(() => router.push(`/admin/produits/${product.id}`)), 800);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function duplicate() {
    if (!confirm("Dupliquer ce produit ? Un brouillon sera créé avec le même contenu.")) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/admin/produits/${product.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/produits/${data.id}/editer`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDuplicating(false);
    }
  }

  const inputCls  = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";
  const labelCls  = "block text-xs font-medium text-gray-700 mb-1";
  const arInputCls = `${inputCls} text-right`;

  const TABS = [
    { id: "general",       label: "Général",       icon: "📋" },
    { id: "bilingue",      label: "Arabe AR",       icon: "🇩🇿" },
    { id: "contenu",       label: "Contenu FR",     icon: "📝" },
    { id: "reglementaire", label: "Réglementaire",  icon: "⚕️" },
    { id: "stock",         label: "Prix & Stock",   icon: "💰" },
    { id: "seo",           label: "SEO",            icon: "🔍" },
    { id: "tags",          label: "Tags & Filtres", icon: "🏷️" },
  ] as const;

  const margin = form.cost_price && form.price && Number(form.price) > 0
    ? Math.round(((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100)
    : null;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/produits" className="hover:text-shifaa-green">Produits</Link>
            <span>›</span>
            <Link href={`/admin/produits/${product.id}`} className="hover:text-shifaa-green">{form.name}</Link>
            <span>›</span>
            <span>Modifier</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Modifier le produit</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={duplicate} disabled={duplicating}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {duplicating ? "Duplication…" : "📋 Dupliquer"}
          </button>
          <a href={`/produit/${form.slug}`} target="_blank"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            ↗ Voir site
          </a>
          <Link href={`/admin/produits/${product.id}`}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Annuler
          </Link>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 bg-shifaa-green text-white rounded-lg text-sm font-medium hover:bg-shifaa-dark disabled:opacity-50 min-w-[130px]">
            {saving ? "Enregistrement…" : success ? "✓ Enregistré !" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error   && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">✅ Produit mis à jour — redirection…</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-0.5 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
              ${tab === t.id
                ? "bg-white border border-b-white border-gray-200 text-shifaa-green -mb-px"
                : "text-gray-500 hover:text-gray-700"}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* ── GÉNÉRAL ── */}
        {tab === "general" && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nom FR *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Marque *</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Slug URL</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={`${inputCls} font-mono text-xs`} />
              <p className="text-xs text-gray-400 mt-1">⚠ Modifier le slug change l&apos;URL du produit</p>
            </div>
            <div>
              <label className={labelCls}>SKU / Référence interne</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Catégorie *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
          {fournisseurs.length > 0 && (
            <div>
              <label className={labelCls}>Fournisseur</label>
              <select value={form.supplier_id} onChange={(e) => set("supplier_id", e.target.value)} className={inputCls}>
                <option value="">Aucun</option>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>Description courte FR *</label>
            <textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} className={inputCls} />
          </div>
          {/* Badges */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
            {([
              ["is_active","✅ Actif"],["is_new","🆕 Nouveau"],["is_best_seller","⭐ Best-seller"],
              ["is_bio","🌿 Bio"],["is_vegan","🐰 Vegan"],["is_sans_parfum","🌸 Sans parfum"],["is_sans_parabene","🧪 Sans parabène"]
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[key] as boolean}
                  onChange={(e) => set(key, e.target.checked)} className="h-4 w-4 accent-shifaa-green" />
                {label}
              </label>
            ))}
          </div>
        </>)}

        {/* ── BILINGUE AR ── */}
        {tab === "bilingue" && (
          <div className="space-y-4" dir="rtl">
            <p className="text-xs text-gray-400 text-right" dir="rtl">
              أدخل المعلومات بالعربية — يُستخدم للعملاء الذين يتصفحون بالعربية
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`${labelCls} text-right`}>الاسم بالعربية</label>
                <input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} className={arInputCls} placeholder="اسم المنتج…" />
              </div>
              <div>
                <label className={`${labelCls} text-right`}>الرابط بالعربية (Slug)</label>
                <input value={form.slug_ar} onChange={(e) => set("slug_ar", e.target.value)} className={`${arInputCls} font-mono text-xs`} />
              </div>
            </div>
            <div>
              <label className={`${labelCls} text-right`}>الوصف المختصر</label>
              <textarea value={form.short_desc_ar} onChange={(e) => set("short_desc_ar", e.target.value)} rows={2} className={arInputCls} placeholder="وصف مختصر للمنتج…" />
            </div>
            <div>
              <label className={`${labelCls} text-right`}>الوصف الكامل</label>
              <textarea value={form.description_ar} onChange={(e) => set("description_ar", e.target.value)} rows={5} className={arInputCls} placeholder="وصف تفصيلي…" />
            </div>
            <div>
              <label className={`${labelCls} text-right`}>طريقة الاستخدام</label>
              <textarea value={form.usage_ar} onChange={(e) => set("usage_ar", e.target.value)} rows={3} className={arInputCls} />
            </div>
            <div>
              <label className={`${labelCls} text-right`}>الاحتياطات</label>
              <textarea value={form.precautions_ar} onChange={(e) => set("precautions_ar", e.target.value)} rows={2} className={arInputCls} />
            </div>
            <div>
              <label className={`${labelCls} text-right`}>المكونات</label>
              <textarea value={form.ingredients_ar} onChange={(e) => set("ingredients_ar", e.target.value)} rows={3} className={arInputCls} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`${labelCls} text-right`}>عنوان SEO (AR)</label>
                <input value={form.meta_title_ar} onChange={(e) => set("meta_title_ar", e.target.value)} className={arInputCls} />
              </div>
              <div>
                <label className={`${labelCls} text-right`}>وصف SEO (AR)</label>
                <input value={form.meta_desc_ar} onChange={(e) => set("meta_desc_ar", e.target.value)} className={arInputCls} />
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENU FR ── */}
        {tab === "contenu" && (<>
          <div>
            <label className={labelCls}>Description complète</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Bénéfices (un par ligne)</label>
            <textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)} rows={4} className={inputCls} placeholder="Hydrate en profondeur&#10;Réduit les rougeurs&#10;…" />
          </div>
          <div>
            <label className={labelCls}>Mode d&apos;utilisation</label>
            <textarea value={form.usage} onChange={(e) => set("usage", e.target.value)} rows={3} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Précautions d&apos;emploi</label>
            <textarea value={form.precautions} onChange={(e) => set("precautions", e.target.value)} rows={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Composition INCI complète</label>
            <textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} rows={3} className={inputCls} placeholder="Aqua, Glycerin, Niacinamide…" />
          </div>
          <div>
            <label className={labelCls}>Principes actifs (séparés par virgule)</label>
            <input value={form.active_ingredients} onChange={(e) => set("active_ingredients", e.target.value)} className={inputCls} placeholder="Acide hyaluronique, Vitamine C…" />
          </div>
        </>)}

        {/* ── RÉGLEMENTAIRE ── */}
        {tab === "reglementaire" && (<>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Code-barres EAN-13</label>
              <input value={form.barcode_ean} onChange={(e) => set("barcode_ean", e.target.value)}
                className={`${inputCls} font-mono`} placeholder="3600000000000" maxLength={13} />
              <p className="text-xs text-gray-400 mt-1">13 chiffres — code-barres DGI/EAN</p>
            </div>
            <div>
              <label className={labelCls}>Catégorie réglementaire</label>
              <select value={form.regulatory_category} onChange={(e) => set("regulatory_category", e.target.value)} className={inputCls}>
                <option value="">Sélectionner…</option>
                <option value="cosmetique">Cosmétique</option>
                <option value="complement_alimentaire">Complément alimentaire</option>
                <option value="dispositif_medical">Dispositif médical (non prescription)</option>
                <option value="hygiene">Hygiène</option>
                <option value="phytotherapie">Phytothérapie</option>
                <option value="orthopédie">Orthopédie légère</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Allergènes déclarés (séparés par virgule)</label>
            <input value={form.allergens} onChange={(e) => set("allergens", e.target.value)} className={inputCls}
              placeholder="Parfum, Limonène, Linalool…" />
          </div>
          <div>
            <label className={labelCls}>Conditions de conservation</label>
            <input value={form.conservation_conditions} onChange={(e) => set("conservation_conditions", e.target.value)}
              className={inputCls} placeholder="Conserver à l'abri de la lumière, T° < 25°C" />
          </div>
          <div>
            <label className={labelCls}>Note de conformité réglementaire</label>
            <textarea value={form.compliance_note} onChange={(e) => set("compliance_note", e.target.value)}
              rows={2} className={inputCls} placeholder="Conforme directive 1223/2009/CE, homologué INAPI…" />
          </div>
          <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_expiry}
                onChange={(e) => set("has_expiry", e.target.checked)} className="w-4 h-4 accent-shifaa-green" />
              <span className="text-sm text-gray-700">📅 Produit avec Date Limite de Consommation (DLC)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.requires_lot}
                onChange={(e) => set("requires_lot", e.target.checked)} className="w-4 h-4 accent-shifaa-green" />
              <span className="text-sm text-gray-700">🔢 Gestion par numéros de lot obligatoire</span>
            </label>
          </div>
        </>)}

        {/* ── PRIX & STOCK ── */}
        {tab === "stock" && (<>
          {/* TVA */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-3">💰 Calcul TVA DGI Algérie</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Taux TVA</label>
                <select value={form.tva_rate} onChange={(e) => handleTvaChange(e.target.value)} className={inputCls}>
                  <option value="9">9% (taux réduit)</option>
                  <option value="19">19% (taux standard)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Prix TTC (DZD) *</label>
                <input type="number" value={form.price} onChange={(e) => handlePriceTTC(e.target.value)}
                  className={inputCls} min={0} />
              </div>
              <div>
                <label className={labelCls}>Prix HT (DZD) — calculé</label>
                <input type="number" value={form.price_ht}
                  onChange={(e) => set("price_ht", e.target.value)}
                  className={`${inputCls} bg-blue-50`} />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Prix barré (DZD)</label>
              <input type="number" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Prix d&apos;achat (DZD)</label>
              <input type="number" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} className={inputCls} min={0} />
              {margin !== null && (
                <p className={`text-xs mt-1 font-medium ${margin >= 30 ? "text-green-600" : margin >= 15 ? "text-amber-600" : "text-red-500"}`}>
                  Marge : {margin}%
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Stock actuel</label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} min={0} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Poids (grammes)</label>
              <input type="number" value={form.weight_grams} onChange={(e) => set("weight_grams", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Code-barres / EAN</label>
              <input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} className={`${inputCls} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelCls}>EAN-13 (DGI)</label>
              <input value={form.barcode_ean} onChange={(e) => set("barcode_ean", e.target.value)} className={`${inputCls} font-mono text-xs`} maxLength={13} />
            </div>
          </div>
        </>)}

        {/* ── SEO ── */}
        {tab === "seo" && (<>
          <div>
            <label className={labelCls}>Meta title FR</label>
            <input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={inputCls} maxLength={70} />
            <p className={`text-xs mt-0.5 ${form.meta_title.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{form.meta_title.length}/70</p>
          </div>
          <div>
            <label className={labelCls}>Meta description FR</label>
            <textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={3} className={inputCls} maxLength={160} />
            <p className={`text-xs mt-0.5 ${form.meta_description.length > 150 ? "text-amber-500" : "text-gray-400"}`}>{form.meta_description.length}/160</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Aperçu Google</p>
            <p className="text-blue-600 text-sm truncate">{form.meta_title || form.name}</p>
            <p className="text-green-700 text-xs">shifaa.dz › produit › {form.slug}</p>
            <p className="text-gray-600 text-xs line-clamp-2 mt-0.5">{form.meta_description || form.short_description}</p>
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
              <label className={labelCls}>Tranche d&apos;âge</label>
              <select value={form.age_group} onChange={(e) => set("age_group", e.target.value)} className={inputCls}>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
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
          </div>
          <div>
            <label className={labelCls}>Types de peau</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SKIN_TYPES.map((s) => (
                <label key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs cursor-pointer border transition
                  ${form.skin_type.includes(s) ? "bg-shifaa-green/10 border-shifaa-green text-shifaa-green font-medium" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                  <input type="checkbox" className="sr-only"
                    checked={form.skin_type.includes(s)}
                    onChange={(e) => set("skin_type", e.target.checked ? [...form.skin_type, s] : form.skin_type.filter((x) => x !== s))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </>)}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-5">
        <Link href={`/admin/produits/${product.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Retour à la fiche
        </Link>
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
