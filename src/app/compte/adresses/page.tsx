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
          <h2 className="font-semibold">Ajouter une adresse</h2>
          <input placeholder="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          <select value={wilaya} required onChange={(e) => setWilaya(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm">
            <option value="">Wilaya</option>
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
          <input placeholder="Commune" required value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          <textarea placeholder="Adresse" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      </div>
    </>
  );
}
