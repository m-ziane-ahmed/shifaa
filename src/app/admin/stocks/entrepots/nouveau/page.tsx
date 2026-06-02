"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NouvelEntrepotPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "", name: "", address: "", wilaya: "", is_default: false, is_active: true,
  });

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";

  async function save() {
    if (!form.code || !form.name) { setError("Code et nom sont obligatoires"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/stocks/entrepots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.push("/admin/stocks/entrepots");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/stocks/entrepots" className="text-gray-400 hover:text-gray-600 text-sm">←</Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nouvel entrepôt</h1>
          <p className="text-sm text-gray-400">Ajouter un entrepôt ou point de stockage</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Code unique *</label>
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className={`${inputCls} font-mono uppercase`} placeholder="MAIN, ALGER, ORANー1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls} placeholder="Entrepôt principal Alger" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className={inputCls} placeholder="Zone industrielle, Bab Ezzouar…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Wilaya</label>
          <input value={form.wilaya} onChange={(e) => setForm((f) => ({ ...f, wilaya: e.target.value }))}
            className={inputCls} placeholder="Alger" />
        </div>
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 accent-shifaa-green" />
            Actif
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="h-4 w-4 accent-shifaa-green" />
            Entrepôt par défaut
          </label>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Link href="/admin/stocks/entrepots" className="text-sm text-gray-400 hover:text-gray-600">← Annuler</Link>
        <button onClick={save} disabled={saving}
          className="px-6 py-2 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark disabled:opacity-50">
          {saving ? "Création…" : "Créer l'entrepôt"}
        </button>
      </div>
    </div>
  );
}
