"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name_fr: string; name_ar: string; slug_fr: string };

export default function EditerMarquePage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [brandId, setBrandId] = useState("");
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
    is_active: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/brands?slug=${slug}`).then((r) => r.json()),
      fetch("/api/categories?level=0&flat=true").then((r) => r.json()),
    ]).then(([brandData, catData]) => {
      const b = brandData.brand;
      if (b) {
        setBrandId(b.id);
        setForm({
          name: b.name ?? "",
          name_ar: b.name_ar ?? "",
          slug: b.slug ?? "",
          description_fr: b.description_fr ?? "",
          description_ar: b.description_ar ?? "",
          short_desc_fr: b.short_desc_fr ?? "",
          short_desc_ar: b.short_desc_ar ?? "",
          logo_url: b.logo_url ?? "",
          banner_url: b.banner_url ?? "",
          country_origin: b.country_origin ?? "DZ",
          is_local: b.is_local ?? false,
          is_featured: b.is_featured ?? false,
          is_certified: b.is_certified ?? false,
          certification_label: b.certification_label ?? "",
          meta_title_fr: b.meta_title_fr ?? "",
          meta_title_ar: b.meta_title_ar ?? "",
          meta_desc_fr: b.meta_desc_fr ?? "",
          meta_desc_ar: b.meta_desc_ar ?? "",
          display_order: b.display_order ?? 99,
          is_active: b.is_active ?? true,
        });
        const brandCats = (b.brand_categories ?? []) as Array<{ is_primary: boolean; categories_v4: { id: string } | null }>;
        setSelectedCats(brandCats.map((bc) => ({
          id: Array.isArray(bc.categories_v4) ? bc.categories_v4[0]?.id : bc.categories_v4?.id ?? "",
          is_primary: bc.is_primary,
        })).filter((c) => c.id));
      }
      setCategories(catData.categories ?? []);
      setLoading(false);
    });
  }, [slug]);

  function toggleCategory(id: string) {
    setSelectedCats((prev) => {
      const exists = prev.find((c) => c.id === id);
      if (exists) return prev.filter((c) => c.id !== id);
      return [...prev, { id, is_primary: prev.length === 0 }];
    });
  }

  function setPrimary(id: string) {
    setSelectedCats((prev) => prev.map((c) => ({ ...c, is_primary: c.id === id })));
  }

  async function submit() {
    setError("");
    if (!form.name.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: brandId, ...form, categories: selectedCats }),
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

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-gray-400 text-sm">Chargement…</p>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/marques/${slug}`} className="text-gray-400 hover:text-gray-600 text-sm">← {form.name}</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-gray-900">Modifier la marque</h1>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">⚠️ {error}</div>}

      <div className="space-y-4">
        {/* Identité */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900">Identité</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nom FR *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nom AR</label>
              <input value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                className={`${inputCls} text-right`} dir="rtl" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${inputCls} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelCls}>Pays d'origine</label>
              <select value={form.country_origin} onChange={(e) => setForm((f) => ({ ...f, country_origin: e.target.value }))} className={inputCls}>
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
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { key: "is_active",   label: "✓ Active",              color: "text-green-600" },
              { key: "is_local",    label: "🇩🇿 Marque algérienne", color: "text-blue-600" },
              { key: "is_featured", label: "⭐ Vedette",            color: "text-amber-600" },
              { key: "is_certified",label: "✓ Certifiée",           color: "text-green-600" },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-shifaa-green rounded" />
                <span className={`text-sm font-medium ${color}`}>{label}</span>
              </label>
            ))}
          </div>
          {form.is_certified && (
            <div>
              <label className={labelCls}>Label certification</label>
              <input value={form.certification_label}
                onChange={(e) => setForm((f) => ({ ...f, certification_label: e.target.value }))}
                className={inputCls} />
            </div>
          )}
        </div>

        {/* Médias */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900">Médias</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>URL Logo</label>
              <input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} className={inputCls} />
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="Logo" className="mt-2 h-12 w-auto object-contain rounded border border-gray-100" />
              )}
            </div>
            <div>
              <label className={labelCls}>URL Bannière</label>
              <input value={form.banner_url} onChange={(e) => setForm((f) => ({ ...f, banner_url: e.target.value }))} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900">Descriptions bilingues</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "short_desc_fr", label: "Description courte FR", rows: 2, rtl: false },
              { key: "short_desc_ar", label: "Description courte AR", rows: 2, rtl: true },
              { key: "description_fr", label: "Description complète FR", rows: 4, rtl: false },
              { key: "description_ar", label: "Description complète AR", rows: 4, rtl: true },
            ].map(({ key, label, rows, rtl }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <textarea value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={`${inputCls} ${rtl ? "text-right" : ""}`} dir={rtl ? "rtl" : "ltr"} rows={rows} />
              </div>
            ))}
          </div>
        </div>

        {/* Catégories */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900">Catégories</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const sel = selectedCats.find((c) => c.id === cat.id);
              return (
                <div key={cat.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                    ${sel ? "border-shifaa-green bg-shifaa-green/5" : "border-gray-200 hover:border-gray-300"}`}
                  onClick={() => toggleCategory(cat.id)}>
                  <input type="checkbox" readOnly checked={!!sel} className="w-4 h-4 accent-shifaa-green pointer-events-none" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{cat.name_fr}</p>
                    <p className="text-[10px] text-gray-400" dir="rtl">{cat.name_ar}</p>
                  </div>
                  {sel && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPrimary(cat.id); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sel.is_primary ? "bg-shifaa-green text-white" : "bg-gray-100 text-gray-500"}`}>
                      {sel.is_primary ? "★" : "Principale ?"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEO */}
        <div className={sectionCls}>
          <h2 className="font-semibold text-gray-900">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "meta_title_fr", label: "Meta title FR", rtl: false },
              { key: "meta_title_ar", label: "Meta title AR", rtl: true },
              { key: "meta_desc_fr", label: "Meta description FR", rtl: false },
              { key: "meta_desc_ar", label: "Meta description AR", rtl: true },
            ].map(({ key, label, rtl }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={`${inputCls} ${rtl ? "text-right" : ""}`} dir={rtl ? "rtl" : "ltr"} />
              </div>
            ))}
          </div>
          <div className="sm:w-1/4">
            <label className={labelCls}>Ordre d'affichage</label>
            <input type="number" value={form.display_order} min={1}
              onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} className={inputCls} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href={`/admin/marques/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">← Annuler</Link>
          <button onClick={submit} disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm
              ${saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-shifaa-green text-white hover:bg-shifaa-dark"}`}>
            {saving ? "Enregistrement…" : "✓ Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
