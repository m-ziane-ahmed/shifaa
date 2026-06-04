"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name_fr: string; name_ar: string; slug_fr: string };

function slugify(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NouvelleCategorieePage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const parentId    = searchParams.get("parent_id") ?? "";
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [parents, setParents] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name_fr: "", name_ar: "", slug_fr: "", slug_ar: "",
    description_fr: "", description_ar: "",
    icon: "", parent_id: parentId, display_order: 1, is_active: true,
  });

  useEffect(() => {
    fetch("/api/categories?level=0&flat=true")
      .then((r) => r.json())
      .then((d) => setParents(d.categories ?? []));
  }, []);

  function handleNameFr(val: string) {
    setForm((f) => ({ ...f, name_fr: val, slug_fr: slugify(val) }));
  }

  async function submit() {
    setError("");
    if (!form.name_fr.trim()) { setError("Le nom FR est obligatoire"); return; }
    if (!form.slug_fr.trim()) { setError("Le slug est obligatoire"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parent_id:     form.parent_id || null,
          level:         form.parent_id ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/categories");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-gray-400 hover:text-gray-600 text-sm">← Catégories</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-gray-900">Nouvelle catégorie</h1>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">⚠️ {error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">

        {/* Catégorie parente */}
        <div>
          <label className={labelCls}>Catégorie parente (laisser vide pour une catégorie racine)</label>
          <select value={form.parent_id}
            onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
            className={inputCls}>
            <option value="">— Catégorie racine —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.name_fr} / {p.name_ar}</option>
            ))}
          </select>
        </div>

        {/* Noms bilingues */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nom FR *</label>
            <input value={form.name_fr} onChange={(e) => handleNameFr(e.target.value)}
              className={inputCls} placeholder="ex: Soins Visage" />
          </div>
          <div>
            <label className={labelCls}>Nom AR</label>
            <input value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
              className={`${inputCls} text-right`} dir="rtl" placeholder="العناية بالوجه" />
          </div>
          <div>
            <label className={labelCls}>Slug FR *</label>
            <input value={form.slug_fr} onChange={(e) => setForm((f) => ({ ...f, slug_fr: slugify(e.target.value) }))}
              className={`${inputCls} font-mono text-xs`} />
          </div>
          <div>
            <label className={labelCls}>Slug AR</label>
            <input value={form.slug_ar} onChange={(e) => setForm((f) => ({ ...f, slug_ar: e.target.value }))}
              className={`${inputCls} font-mono text-xs text-right`} dir="rtl" />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Description FR</label>
            <textarea value={form.description_fr}
              onChange={(e) => setForm((f) => ({ ...f, description_fr: e.target.value }))}
              className={inputCls} rows={2} />
          </div>
          <div>
            <label className={labelCls}>Description AR</label>
            <textarea value={form.description_ar}
              onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
              className={`${inputCls} text-right`} dir="rtl" rows={2} />
          </div>
        </div>

        {/* Icône et ordre */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Icône (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className={inputCls} placeholder="💊" />
          </div>
          <div>
            <label className={labelCls}>Ordre d'affichage</label>
            <input type="number" value={form.display_order} min={1}
              onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
              className={inputCls} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 accent-shifaa-green" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Link href="/admin/categories" className="text-sm text-gray-400 hover:text-gray-600">← Annuler</Link>
        <button onClick={submit} disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm
            ${saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-shifaa-green text-white hover:bg-shifaa-dark"}`}>
          {saving ? "Création…" : "✓ Créer la catégorie"}
        </button>
      </div>
    </div>
  );
}
