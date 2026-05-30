import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Codes promo | Admin Shifaa" };

function generateCode(prefix: string, length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix ? prefix.toUpperCase() + "-" : "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
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
  await supabase.from("promo_codes").update({ active: false })
    .lt("expires_at", new Date().toISOString());
  revalidatePath("/admin/codes-promo");
}

export default async function AdminCodesPromo() {
  const supabase = createAdminClient();
  const { data: promos } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  const active = (promos ?? []).filter((p) => p.active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Codes promo</h1>
          <p className="text-sm text-gray-500 mt-1">{active} actif(s) / {(promos ?? []).length} total</p>
        </div>
        <form action={bulkDeactivate}>
          <button type="submit"
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            ✗ Désactiver les expirés
          </button>
        </form>
      </div>

      {/* Formulaire création */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-medium text-gray-900 mb-4">Créer des codes (unitaire ou en masse)</h2>
        <form action={createPromo} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Code unique (ou laisser vide)</label>
            <input name="code" placeholder="EX: PROMO20"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Préfixe (génération auto)</label>
            <input name="prefix" placeholder="SHIFAA"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Quantité à générer</label>
            <input name="count" type="number" defaultValue={1} min={1} max={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type remise</label>
            <select name="discount_type"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30">
              <option value="percent">% pourcentage</option>
              <option value="fixed">Montant fixe DZD</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Valeur *</label>
            <input name="value" type="number" required min={1} placeholder="10 ou 500"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Commande min. (DZD)</label>
            <input name="min_order" type="number" defaultValue={0} min={0}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Utilisations max.</label>
            <input name="max_uses" type="number" min={1} placeholder="Illimité"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Expiration</label>
            <input name="expires_at" type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div className="col-span-2 md:col-span-4">
            <button type="submit"
              className="bg-[#18534F] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors">
              🎟️ Générer les codes
            </button>
          </div>
        </form>
      </div>

      {/* Table codes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Remise</th>
                <th className="px-4 py-3 text-right">Min. commande</th>
                <th className="px-4 py-3 text-center">Utilisations</th>
                <th className="px-4 py-3 text-left">Expiration</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(promos ?? []).map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-800">{p.code}</td>
                    <td className="px-4 py-3">
                      {p.discount_type === "percent"
                        ? <span className="text-green-600 font-medium">-{p.value}%</span>
                        : <span className="text-green-600 font-medium">-{formatDZD(p.value)}</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {p.min_order > 0 ? formatDZD(p.min_order) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.used_count}{p.max_uses ? `/${p.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.expires_at
                        ? <span className={isExpired ? "text-red-500" : "text-gray-500"}>
                            {isExpired ? "⚠ " : ""}{new Date(p.expires_at).toLocaleDateString("fr-DZ")}
                          </span>
                        : <span className="text-gray-400">Sans limite</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={async () => { "use server"; await togglePromo(p.id, !p.active); }}>
                        <button type="submit"
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active && !isExpired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.active && !isExpired ? "Actif" : "Inactif"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={async () => { "use server"; await deletePromo(p.id); }}>
                        <button type="submit" className="text-xs text-red-500 hover:underline">Supprimer</button>
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
