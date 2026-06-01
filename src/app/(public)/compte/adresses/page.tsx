"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { WILAYAS } from "@/data/wilayas";
import type { AddressRecord } from "@/lib/store-types";

export default function AdressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [label, setLabel] = useState("Domicile");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/adresses");
  }, [user, loading, router]);

  function load() {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => setAddresses(d.addresses ?? []));
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, wilaya, commune, address, phone, isDefault: addresses.length === 0 }),
    });
    setCommune("");
    setAddress("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    load();
  }

  if (loading || !user) return null;

  return (
    <>
      <PageHeader title="Mes adresses" />
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link href="/compte" className="text-sm text-shifaa-green hover:underline">← Mon compte</Link>
        <ul className="mt-8 space-y-4">
          {addresses.map((a) => (
            <li key={a.id} className="card-surface flex justify-between p-4">
              <div>
                <p className="font-medium">{a.label}{a.isDefault ? " (par défaut)" : ""}</p>
                <p className="text-sm text-shifaa-muted">
                  {WILAYAS.find((w) => w.code === a.wilaya)?.name}, {a.commune}
                </p>
                <p className="text-sm">{a.address}</p>
              </div>
              <button type="button" onClick={() => remove(a.id)} className="text-sm text-red-600 hover:underline">
                Supprimer
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
          <h2 className="font-semibold text-shifaa-ink">Ajouter une adresse</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-shifaa-ink">Libellé</label>
              <input placeholder="Ex : Domicile" value={label} onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-xl border border-shifaa-border bg-white px-3 py-2.5 text-sm text-shifaa-ink placeholder:text-shifaa-muted focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-shifaa-ink">Téléphone</label>
              <input placeholder="Ex : 0550 000 000" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-shifaa-border bg-white px-3 py-2.5 text-sm text-shifaa-ink placeholder:text-shifaa-muted focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-shifaa-ink">Wilaya *</label>
            <select required value={wilaya} onChange={(e) => setWilaya(e.target.value)}
              className="w-full rounded-xl border border-shifaa-border bg-white px-3 py-2.5 text-sm text-shifaa-ink focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20">
              <option value="">Sélectionnez une wilaya</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-shifaa-ink">Commune *</label>
            <input required placeholder="Ex : Bab Ezzouar" value={commune} onChange={(e) => setCommune(e.target.value)}
              className="w-full rounded-xl border border-shifaa-border bg-white px-3 py-2.5 text-sm text-shifaa-ink placeholder:text-shifaa-muted focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-shifaa-ink">Adresse complète *</label>
            <textarea required placeholder="N° rue, quartier, bâtiment…" value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
              className="w-full rounded-xl border border-shifaa-border bg-white px-3 py-2.5 text-sm text-shifaa-ink placeholder:text-shifaa-muted focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20 resize-none" />
          </div>
          <button type="submit" className="btn-primary w-full">Enregistrer l&apos;adresse</button>
        </form>
      </div>
    </>
  );
}
