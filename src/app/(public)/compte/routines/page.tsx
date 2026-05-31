"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

const ROUTINE_TYPES = [
  { value: "visage", label: "Routine visage", icon: "🌸", href: "/boutique?categorie=visage-peau", color: "bg-pink-50 border-pink-200" },
  { value: "cheveux", label: "Routine cheveux", icon: "💇", href: "/boutique?categorie=cheveux", color: "bg-purple-50 border-purple-200" },
  { value: "bebe", label: "Routine bébé", icon: "👶", href: "/boutique?categorie=bebe-maternite", color: "bg-blue-50 border-blue-200" },
  { value: "bien-etre", label: "Routine bien-être", icon: "☀️", href: "/boutique?categorie=bien-etre", color: "bg-amber-50 border-amber-200" },
  { value: "custom", label: "Ma routine custom", icon: "✨", href: "/boutique", color: "bg-green-50 border-green-200" },
];

type Routine = {
  id: string;
  name: string;
  type: string;
  products: Array<{ productId: string; name: string; step: number; frequency: string }>;
  is_active: boolean;
  created_at: string;
};

const SUGGESTED_ROUTINES = [
  {
    type: "visage",
    name: "Routine visage hydratation",
    steps: [
      { step: 1, label: "Nettoyant doux", frequency: "Matin & soir" },
      { step: 2, label: "Tonique hydratant", frequency: "Matin & soir" },
      { step: 3, label: "Sérum hydratant", frequency: "Matin & soir" },
      { step: 4, label: "Crème hydratante", frequency: "Matin & soir" },
      { step: 5, label: "SPF 50", frequency: "Matin uniquement" },
    ],
  },
  {
    type: "cheveux",
    name: "Routine cheveux fortifiante",
    steps: [
      { step: 1, label: "Shampoing anti-chute", frequency: "2-3× / semaine" },
      { step: 2, label: "Après-shampoing nourrissant", frequency: "2-3× / semaine" },
      { step: 3, label: "Masque capillaire", frequency: "1× / semaine" },
      { step: 4, label: "Complément fortifiant", frequency: "1× / jour" },
    ],
  },
];

export default function RoutinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState("visage");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/routines");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from("routines").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRoutines(data ?? []));
  }, [user]);

  async function createRoutine() {
    if (!user || !newName.trim()) return;
    const { data } = await supabase.from("routines").insert({
      user_id: user.id,
      name: newName.trim(),
      type: newType,
      products: [],
    }).select().single();
    if (data) setRoutines((prev) => [data, ...prev]);
    setCreating(false);
    setNewName("");
  }

  async function deleteRoutine(id: string) {
    await supabase.from("routines").delete().eq("id", id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading || !user) return null;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Mon compte", href: "/compte" }, { label: "Mes routines" }]} />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-shifaa-ink">Mes routines</h1>
            <p className="text-sm text-shifaa-muted mt-1">Créez et gérez vos routines de soins personnalisées</p>
          </div>
          <button type="button" onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-shifaa-green px-4 py-2 text-sm font-medium text-white hover:bg-[#0f3d3a] transition-colors">
            <Plus className="h-4 w-4" /> Nouvelle routine
          </button>
        </div>

        {/* Formulaire création */}
        {creating && (
          <div className="card-surface p-5 space-y-4">
            <h3 className="font-medium text-shifaa-ink">Nouvelle routine</h3>
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {ROUTINE_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setNewType(t.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all
                      ${newType === t.value ? "border-shifaa-green bg-shifaa-lime/10 text-shifaa-green" : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"}`}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-shifaa-ink mb-1 block">Nom de la routine</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Ma routine visage du matin"
                className="w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setCreating(false)}
                className="flex-1 border border-shifaa-border rounded-xl py-2 text-sm text-shifaa-muted hover:bg-shifaa-cream transition-colors">
                Annuler
              </button>
              <button type="button" onClick={createRoutine} disabled={!newName.trim()}
                className="flex-1 bg-shifaa-green text-white rounded-xl py-2 text-sm font-medium hover:bg-[#0f3d3a] transition-colors disabled:opacity-50">
                Créer
              </button>
            </div>
          </div>
        )}

        {/* Mes routines */}
        {routines.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-shifaa-ink">Mes routines ({routines.length})</h2>
            {routines.map((r) => {
              const typeInfo = ROUTINE_TYPES.find((t) => t.value === r.type);
              return (
                <div key={r.id} className={`card-surface p-4 border ${typeInfo?.color ?? ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{typeInfo?.icon ?? "✨"}</span>
                      <div>
                        <p className="font-medium text-shifaa-ink">{r.name}</p>
                        <p className="text-xs text-shifaa-muted">{typeInfo?.label} · {r.products.length} produit(s)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={typeInfo?.href ?? "/boutique"}
                        className="text-xs text-shifaa-green hover:underline border border-shifaa-green/30 px-2 py-1 rounded-lg">
                        + Ajouter produits
                      </Link>
                      <button type="button" onClick={() => deleteRoutine(r.id)}
                        className="text-shifaa-muted hover:text-red-500 p-1 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {r.products.length === 0 && (
                    <div className="mt-3 rounded-xl bg-white/60 border border-dashed border-shifaa-border p-3 text-center text-xs text-shifaa-muted">
                      Aucun produit dans cette routine. Explorez le catalogue pour en ajouter.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Routines suggérées */}
        <div>
          <h2 className="font-medium text-shifaa-ink mb-4">Routines suggérées</h2>
          <div className="space-y-4">
            {SUGGESTED_ROUTINES.map((routine) => {
              const typeInfo = ROUTINE_TYPES.find((t) => t.value === routine.type);
              return (
                <div key={routine.type} className="card-surface p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{typeInfo?.icon}</span>
                    <h3 className="font-medium text-shifaa-ink">{routine.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {routine.steps.map(({ step, label, frequency }) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-shifaa-lime/30 text-xs font-bold text-shifaa-green">
                          {step}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-shifaa-ink">{label}</span>
                        </div>
                        <span className="text-xs text-shifaa-muted">{frequency}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={typeInfo?.href ?? "/boutique"}
                      className="flex-1 text-center rounded-xl border border-shifaa-green text-shifaa-green py-2 text-sm font-medium hover:bg-shifaa-lime/10 transition-colors">
                      Explorer les produits →
                    </Link>
                    <button type="button"
                      onClick={async () => {
                        if (!user) return;
                        const { data } = await supabase.from("routines").insert({
                          user_id: user.id,
                          name: routine.name,
                          type: routine.type,
                          products: [],
                        }).select().single();
                        if (data) setRoutines((prev) => [data, ...prev]);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-shifaa-green text-white px-3 py-2 text-sm font-medium hover:bg-[#0f3d3a] transition-colors">
                      <Plus className="h-4 w-4" /> Adopter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
