"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name_fr: string; name_ar: string; slug_fr: string };

function slugify(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NouvelleMaquePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<{ id: string; is_primary: boolean }[]>([]);

  const [form, setForm] = useState({
    name: "", name_ar: "", slug: "",
    description_fr: "", description_ar: "",
    short_desc_fr: "", short_desc_ar: "",
    logo_url: "", banner_url: "",
    country_origin: "DZ",
    is_local: false, is_featured: false, is_certified: false,
    certification_label: "",
    meta_title_fr: "", meta_title_ar: "",
    meta_desc_fr: "", meta_desc_ar: "",
    display_order: 99,
  });

  useEffect(() => {
    fetch("/api/categories?level=0&flat=true")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  // Auto-slug depuis le nom
  function handleNameChange(val: string) {
    setForm((f) => ({
      ...f,
      name: val,
      slug: slugify(val),
      meta_title_fr: f.meta_title_fr || val,
    }));
  }

  function toggleCategory(id: string) {
    setSelectedCats((prev) => {
      const exists = prev.find((c) => c.id === id);
      if (exists) return prev.filter((c) => c.id !== id);
      const newList = [...prev, { id, is_primary: prev.length === 0 }];
      return newList;
    });
  }

  function setPrimary(id: string) {
    setSelectedCats((prev) => prev.map((c) => ({ ...c, is_primary: c.id === id })));
  }

  async function submit() {
    setError("");
    if (!form.name.trim()) { setError("Le nom est obligatoire"); return; }
    if (!form.slug.trim()) { setError("Le slug est obligatoire"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories: selectedCats,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/marques/${data.brand.slug}`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";
  const sectionCls = "bg-white rounded-2xl border border-gray-200 p-6 space-y-4";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/marques" className="text-gray-400 hover:text-gray-600 text-sm">← Marques</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-gray-900">Nouvelle marque</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">⚠️ {error}</div>
      )}

      <div className="space-y-4">

        {/* ── Identité bilingue ── */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-shifaa-green rounded-full text-white text-xs flex items-center justify-center font-bold">1</span>
            Identité de la marque
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nom FR *</label>
              <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                className={inputCls} placeholder="ex: BioAlgérie" />
            </div>
            <div>
              <label className={labelCls}>Nom AR</label>
              <input value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" placeholder="مثال: بيو الجزائر" />
            </div>
            <div>
              <label className={labelCls}>Slug URL *</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className={`${inputCls} font-mono text-xs`} placeholder="bio-algerie" />
              <p className="text-[10px] text-gray-400 mt-1">/boutique?brand={form.slug || "..."}</p>
            </div>
            <div>
              <label className={labelCls}>Pays d&apos;origine</label>
              <select value={form.country_origin} onChange={(e) => setForm((f) => ({ ...f, country_origin: e.target.value }))}
                className={inputCls}>
                <option value="DZ">🇩🇿 Algérie</option>
                <option value="FR">🇫🇷 France</option>
                <option value="DE">🇩🇪 Allemagne</option>
                <option value="IT">🇮🇹 Italie</option>
                <option value="US">🇺🇸 États-Unis</option>
                <option value="MA">🇲🇦 Maroc</option>
                <option value="TN">🇹🇳 Tunisie</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { key: "is_local", label: "🇩🇿 Marque algérienne", color: "text-blue-600" },
              { key: "is_featured", label: "⭐ Marque vedette", color: "text-amber-600" },
              { key: "is_certified", label: "✓ Certifiée", color: "text-green-600" },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-shifaa-green" />
                <span className={`text-sm font-medium ${color}`}>{label}</span>
              </label>
            ))}
          </div>
          {form.is_certified && (
            <div>
              <label className={labelCls}>Label de certification</label>
              <input value={form.certification_label}
                onChange={(e) => setForm((f) => ({ ...f, certification_label: e.target.value }))}
                className={inputCls} placeholder="ISO 22716, BIO, COSMOS…" />
            </div>
          )}
        </div>

        {/* ── Médias ── */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-shifaa-green rounded-full text-white text-xs flex items-center justify-center font-bold">2</span>
            Médias
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>URL Logo</label>
              <input value={form.logo_url}
                onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                className={inputCls} placeholder="https://…/logo.png" />
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="Logo aperçu"
                  className="mt-2 h-12 w-auto object-contain rounded border border-gray-100" />
              )}
            </div>
            <div>
              <label className={labelCls}>URL Bannière</label>
              <input value={form.banner_url}
                onChange={(e) => setForm((f) => ({ ...f, banner_url: e.target.value }))}
                className={inputCls} placeholder="https://…/banner.jpg" />
            </div>
          </div>
        </div>

        {/* ── Descriptions bilingues ── */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-shifaa-green rounded-full text-white text-xs flex items-center justify-center font-bold">3</span>
            Descriptions bilingues
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Description courte FR</label>
              <textarea value={form.short_desc_fr}
                onChange={(e) => setForm((f) => ({ ...f, short_desc_fr: e.target.value }))}
                className={inputCls} rows={2} placeholder="Résumé en quelques mots (FR)…" />
            </div>
            <div>
              <label className={labelCls}>Description courte AR</label>
              <textarea value={form.short_desc_ar}
                onChange={(e) => setForm((f) => ({ ...f, short_desc_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" rows={2} placeholder="ملخص قصير…" />
            </div>
            <div>
              <label className={labelCls}>Description complète FR</label>
              <textarea value={form.description_fr}
                onChange={(e) => setForm((f) => ({ ...f, description_fr: e.target.value }))}
                className={inputCls} rows={4} placeholder="Présentation de la marque…" />
            </div>
            <div>
              <label className={labelCls}>Description complète AR</label>
              <textarea value={form.description_ar}
                onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" rows={4} placeholder="تقديم العلامة التجارية…" />
            </div>
          </div>
        </div>

        {/* ── Catégories ── */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-shifaa-green rounded-full text-white text-xs flex items-center justify-center font-bold">4</span>
            Catégories
            {selectedCats.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-shifaa-green/10 text-shifaa-green text-xs rounded-full">
                {selectedCats.length} sélectionnée{selectedCats.length > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400">Cochez les catégories couvertes. La première cochée sera la catégorie principale.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const sel = selectedCats.find((c) => c.id === cat.id);
              return (
                <div key={cat.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                    ${sel ? "border-shifaa-green bg-shifaa-green/5" : "border-gray-200 hover:border-gray-300"}`}
                  onClick={() => toggleCategory(cat.id)}>
                  <input type="checkbox" readOnly checked={!!sel}
                    className="w-4 h-4 rounded accent-shifaa-green pointer-events-none" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{cat.name_fr}</p>
                    <p className="text-[10px] text-gray-400" dir="rtl">{cat.name_ar}</p>
                  </div>
                  {sel && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPrimary(cat.id); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition
                        ${sel.is_primary ? "bg-shifaa-green text-white" : "bg-gray-100 text-gray-500 hover:bg-shifaa-green/20"}`}>
                      {sel.is_primary ? "★ Principale" : "Principale ?"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SEO ── */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-shifaa-green rounded-full text-white text-xs flex items-center justify-center font-bold">5</span>
            SEO bilingue
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Meta title FR</label>
              <input value={form.meta_title_fr}
                onChange={(e) => setForm((f) => ({ ...f, meta_title_fr: e.target.value }))}
                className={inputCls} placeholder="ex: BioAlgérie — Cosmétiques naturels" />
              <p className={`text-[10px] mt-0.5 ${form.meta_title_fr.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                {form.meta_title_fr.length}/60
              </p>
            </div>
            <div>
              <label className={labelCls}>Meta title AR</label>
              <input value={form.meta_title_ar}
                onChange={(e) => setForm((f) => ({ ...f, meta_title_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" placeholder="العنوان للعرب" />
            </div>
            <div>
              <label className={labelCls}>Meta description FR</label>
              <textarea value={form.meta_desc_fr}
                onChange={(e) => setForm((f) => ({ ...f, meta_desc_fr: e.target.value }))}
                className={inputCls} rows={2} placeholder="Description pour les moteurs de recherche…" />
              <p className={`text-[10px] mt-0.5 ${form.meta_desc_fr.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                {form.meta_desc_fr.length}/160
              </p>
            </div>
            <div>
              <label className={labelCls}>Meta description AR</label>
              <textarea value={form.meta_desc_ar}
                onChange={(e) => setForm((f) => ({ ...f, meta_desc_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" rows={2} />
            </div>
          </div>
          <div className="sm:w-1/3">
            <label className={labelCls}>Ordre d&apos;affichage</label>
            <input type="number" value={form.display_order} min={1}
              onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
              className={inputCls} />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between">
          <Link href="/admin/marques" className="text-sm text-gray-400 hover:text-gray-600">← Annuler</Link>
          <div className="flex gap-3">
            <button onClick={() => { setForm((f) => ({ ...f })); submit(); }}
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm
                ${saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-shifaa-green text-white hover:bg-shifaa-dark"}`}>
              {saving ? "Enregistrement…" : "✓ Créer la marque"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
