"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Save, Check, Heart, Bell } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

const SKIN_TYPES = ["Normale", "Sèche", "Grasse", "Mixte", "Sensible", "Acnéique", "Mature"];
const HAIR_TYPES = ["Normaux", "Secs", "Gras", "Mixtes", "Fins", "Épais", "Frisés / bouclés"];
const AGE_GROUPS = ["< 18 ans", "18–25 ans", "26–35 ans", "36–45 ans", "46–55 ans", "56 ans et +"];
const GENDERS = ["Femme", "Homme", "Non-binaire", "Préfère ne pas préciser"];
const WELLNESS_GOALS = [
  "Hydratation", "Anti-âge", "Acné & imperfections", "Protection solaire",
  "Chute de cheveux", "Immunité", "Sport & performance", "Sommeil & détente",
  "Grossesse", "Soins bébé", "Digestion", "Bio & naturel",
];
const DELIVERY_MODES = [
  { value: "home", label: "Domicile" },
  { value: "relay", label: "Point relais" },
];
const PAYMENT_MODES = [
  { value: "cod", label: "À la livraison" },
  { value: "cib", label: "CIB" },
  { value: "edahabia", label: "Edahabia" },
];

type Prefs = {
  skin_type: string;
  hair_type: string;
  age_group: string;
  gender: string;
  wellness_goals: string[];
  preferred_delivery: string;
  preferred_payment: string;
  newsletter: boolean;
  sms_notif: boolean;
  push_notif: boolean;
};

const DEFAULT: Prefs = {
  skin_type: "",
  hair_type: "",
  age_group: "",
  gender: "",
  wellness_goals: [],
  preferred_delivery: "home",
  preferred_payment: "cod",
  newsletter: true,
  sms_notif: false,
  push_notif: false,
};

export default function PreferencesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/preferences");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles")
      .select("skin_type,hair_type,age_group,gender,wellness_goals,preferred_delivery,preferred_payment,newsletter,sms_notif,push_notif")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setPrefs({ ...DEFAULT, ...data });
      });
  }, [user]);

  function toggleGoal(goal: string) {
    setPrefs((p) => ({
      ...p,
      wellness_goals: p.wellness_goals.includes(goal)
        ? p.wellness_goals.filter((g) => g !== goal)
        : [...p.wellness_goals, goal],
    }));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      skin_type: prefs.skin_type || null,
      hair_type: prefs.hair_type || null,
      age_group: prefs.age_group || null,
      gender: prefs.gender || null,
      wellness_goals: prefs.wellness_goals,
      preferred_delivery: prefs.preferred_delivery,
      preferred_payment: prefs.preferred_payment,
      newsletter: prefs.newsletter,
      sms_notif: prefs.sms_notif,
      push_notif: prefs.push_notif,
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading || !user) return null;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Mon compte", href: "/compte" }, { label: "Préférences" }]} />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 space-y-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-shifaa-ink">Mes préférences</h1>
            <p className="text-sm text-shifaa-muted mt-1">
              Personnalisez votre expérience pour des recommandations adaptées à votre profil
            </p>
          </div>
        </div>

        {/* ── Profil santé & bien-être ─────────────────────── */}
        <div className="card-surface p-6 space-y-5">
          <h2 className="font-semibold text-shifaa-ink flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Profil santé & bien-être
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Type de peau */}
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Type de peau</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((s) => (
                  <button key={s} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, skin_type: p.skin_type === s ? "" : s }))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                      ${prefs.skin_type === s
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de cheveux */}
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Type de cheveux</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_TYPES.map((h) => (
                  <button key={h} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, hair_type: p.hair_type === h ? "" : h }))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                      ${prefs.hair_type === h
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Tranche d'âge */}
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Tranche d&apos;âge</label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((a) => (
                  <button key={a} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, age_group: p.age_group === a ? "" : a }))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                      ${prefs.age_group === a
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Genre</label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button key={g} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, gender: p.gender === g ? "" : g }))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                      ${prefs.gender === g
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Objectifs bien-être */}
          <div>
            <label className="text-sm font-medium text-shifaa-ink mb-2 block">Mes objectifs bien-être</label>
            <p className="text-xs text-shifaa-muted mb-3">
              Sélectionnez vos besoins — nous adapterons nos recommandations
            </p>
            <div className="flex flex-wrap gap-2">
              {WELLNESS_GOALS.map((goal) => (
                <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1
                    ${prefs.wellness_goals.includes(goal)
                      ? "border-shifaa-green bg-shifaa-lime/20 text-shifaa-green"
                      : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                  {prefs.wellness_goals.includes(goal) && <Check className="h-3 w-3" />}
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Préférences commande ────────────────────────── */}
        <div className="card-surface p-6 space-y-5">
          <h2 className="font-semibold text-shifaa-ink flex items-center gap-2">
            <Settings className="h-5 w-5 text-shifaa-green" />
            Préférences de commande
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Mode de livraison préféré</label>
              <div className="flex gap-2">
                {DELIVERY_MODES.map((m) => (
                  <button key={m.value} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, preferred_delivery: m.value }))}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all
                      ${prefs.preferred_delivery === m.value
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Paiement préféré</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_MODES.map((m) => (
                  <button key={m.value} type="button"
                    onClick={() => setPrefs((p) => ({ ...p, preferred_payment: m.value }))}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all
                      ${prefs.preferred_payment === m.value
                        ? "border-shifaa-green bg-shifaa-green text-white"
                        : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Notifications ──────────────────────────────── */}
        <div className="card-surface p-6 space-y-4">
          <h2 className="font-semibold text-shifaa-ink flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Notifications & communication
          </h2>
          {[
            { key: "newsletter", label: "Newsletter & offres par e-mail", sub: "Promotions, nouveautés et conseils" },
            { key: "sms_notif", label: "Notifications SMS", sub: "Confirmation et suivi de commande" },
            { key: "push_notif", label: "Notifications push", sub: "Alertes stock, retours en stock, prix" },
          ].map(({ key, label, sub }) => (
            <label key={key} className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5">
                <input type="checkbox"
                  checked={prefs[key as keyof Prefs] as boolean}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="sr-only" />
                <div
                  onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key as keyof Prefs] }))}
                  className={`h-5 w-9 rounded-full cursor-pointer transition-colors ${prefs[key as keyof Prefs] ? "bg-shifaa-green" : "bg-gray-200"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${prefs[key as keyof Prefs] ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-shifaa-ink">{label}</p>
                <p className="text-xs text-shifaa-muted">{sub}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Bouton sauvegarder sticky */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <Link href="/compte" className="text-sm text-shifaa-muted hover:text-shifaa-green">
              ← Mon compte
            </Link>
            <button type="button" onClick={save} disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-shifaa-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3d3a] transition-colors disabled:opacity-50">
              {saved ? <><Check className="h-4 w-4" /> Enregistré !</> : saving ? "Enregistrement…" : <><Save className="h-4 w-4" /> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
