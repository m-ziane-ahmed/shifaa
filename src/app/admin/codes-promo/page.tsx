import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Codes promo | Admin Shifaa" };

function generateCode(prefix: string, length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix ? prefix.toUpperCase() + "-" : "";
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createPromo(fd: FormData) {
  "use server";
  const supabase = createAdminClient();
  const count = Number(fd.get("count") ?? 1);
  const prefix = (fd.get("prefix") as string) ?? "";
  const codes = Array.from({ length: count }, () => ({
    code: count === 1 && fd.get("code") ? (fd.get("code") as string).toUpperCase() : generateCode(prefix),
    discount_type: fd.get("discount_type") as string,
    value: Number(fd.get("value")),
    min_order: Number(fd.get("min_order") ?? 0),
    max_uses: fd.get("max_uses") ? Number(fd.get("max_uses")) : null,
    expires_at: fd.get("expires_at") || null,
    active: true,
  }));
  await supabase.from("promo_codes").insert(codes);
  revalidatePath("/admin/codes-promo");
}

async function togglePromo(id: string, active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("promo_codes").update({ active }).eq("id", id);
  revalidatePath("/admin/codes-promo");
}

async function deletePromo(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("promo_codes").delete().eq("id", id);
  revalidatePath("/admin/codes-promo");
}

async function bulkDeactivate() {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("promo_codes").update({ active: false }).lt("expires_at", new Date().toISOString());
  revalidatePath("/admin/codes-promo");
}

export default async function AdminCodesPromo() {
  const supabase = createAdminClient();
  const { data: promos } = await supabase
    .from("promo_codes").select("*").order("created_at", { ascending: false });

  const active = (promos ?? []).filter((p) => p.active && (!p.expires_at || new Date(p.expires_at) > new Date())).length;
  const expired = (promos ?? []).filter((p) => p.expires_at && new Date(p.expires_at) < new Date()).length;
  const totalUses = (promos ?? []).reduce((s, p) => s + (p.used_count ?? 0), 0);

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 bg-white";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Codes promo</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {active} actif(s) · {expired} expiré(s) · {totalUses} utilisations
          </p>
        </div>
        <form action={bulkDeactivate}>
          <button type="submit"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            ✗ Désactiver les expirés
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-700">{active}</p>
          <p className="text-xs text-green-500 mt-0.5">Codes actifs</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-500">{expired}</p>
          <p className="text-xs text-red-400 mt-0.5">Codes expirés</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-blue-600">{totalUses}</p>
          <p className="text-xs text-blue-400 mt-0.5">Utilisations totales</p>
        </div>
      </div>

      {/* Formulaire création */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🎟️ Créer des codes
        </h2>
        <form action={createPromo} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Code unique</label>
            <input name="code" placeholder="SUMMER25" className={`${inputCls} font-mono uppercase`} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Préfixe auto</label>
            <input name="prefix" placeholder="SHIFAA" className={`${inputCls} font-mono uppercase`} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Quantité</label>
            <input name="count" type="number" defaultValue={1} min={1} max={100} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Type remise</label>
            <select name="discount_type" className={inputCls}>
              <option value="percent">% pourcentage</option>
              <option value="fixed">Montant fixe DZD</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Valeur *</label>
            <input name="value" type="number" required min={1} placeholder="10" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Commande min. (DZD)</label>
            <input name="min_order" type="number" defaultValue={0} min={0} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Utilisations max.</label>
            <input name="max_uses" type="number" min={1} placeholder="Illimité" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Expiration</label>
            <input name="expires_at" type="date" className={inputCls} />
          </div>
          <div className="col-span-2 md:col-span-4">
            <button type="submit"
              className="px-6 py-2.5 bg-shifaa-green text-white rounded-xl text-sm font-medium hover:bg-shifaa-dark transition shadow-sm">
              🎟️ Générer les codes
            </button>
          </div>
        </form>
      </div>

      {/* Table codes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Code", "Remise", "Min. commande", "Utilisations", "Expiration", "Statut", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(promos ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Aucun code promo créé
                  </td>
                </tr>
              )}
              {(promos ?? []).map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                const isActive = p.active && !isExpired;
                const usagePct = p.max_uses ? Math.round(((p.used_count ?? 0) / p.max_uses) * 100) : 0;
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition ${!isActive ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg text-sm">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${isActive ? "text-green-600" : "text-gray-400"}`}>
                        {p.discount_type === "percent" ? `-${p.value}%` : `-${formatDZD(p.value)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.min_order > 0 ? formatDZD(p.min_order) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {p.used_count ?? 0}{p.max_uses ? `/${p.max_uses}` : " fois"}
                        </p>
                        {p.max_uses && (
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-shifaa-green rounded-full" style={{ width: `${usagePct}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.expires_at ? (
                        <span className={`text-xs ${isExpired ? "text-red-500 font-medium" : "text-gray-500"}`}>
                          {isExpired ? "⚠️ " : ""}{new Date(p.expires_at).toLocaleDateString("fr-DZ")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">Sans limite</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={async () => { "use server"; await togglePromo(p.id, !p.active); }}>
                        <button type="submit"
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition
                            ${isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {isActive ? "✓ Actif" : "Inactif"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <form action={async () => { "use server"; await deletePromo(p.id); }}>
                        <button type="submit"
                          className="text-xs text-red-400 hover:text-red-600 hover:underline transition">
                          Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
