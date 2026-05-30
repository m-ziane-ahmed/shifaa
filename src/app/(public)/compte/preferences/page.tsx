"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";

export default function PreferencesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [newsletter, setNewsletter] = useState(true);
  const [sms, setSms] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/preferences");
  }, [user, loading, router]);

  useEffect(() => {
    const raw = localStorage.getItem("shifaa-prefs");
    if (raw) {
      const p = JSON.parse(raw);
      setNewsletter(p.newsletter ?? true);
      setSms(p.sms ?? false);
    }
  }, []);

  function save() {
    localStorage.setItem("shifaa-prefs", JSON.stringify({ newsletter, sms }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !user) return null;

  return (
    <>
      <PageHeader title="Préférences" />
      <div className="mx-auto max-w-md px-4 py-10 md:px-6">
        <Link href="/compte" className="text-sm text-shifaa-green hover:underline">← Mon compte</Link>
        <div className="card-surface mt-8 space-y-4 p-6">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="rounded" />
            Recevoir la newsletter et les offres par e-mail
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="rounded" />
            Notifications SMS (commandes, livraison)
          </label>
          <button type="button" onClick={save} className="btn-primary w-full">
            {saved ? "Enregistré ✓" : "Enregistrer"}
          </button>
        </div>
      </div>
    </>
  );
}
