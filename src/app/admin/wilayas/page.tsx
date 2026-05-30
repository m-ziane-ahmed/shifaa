import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wilayas & Tarifs | Admin Shifaa" };

async function updateWilaya(code: string, data: FormData) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("wilaya_config").update({
    fee_home: Number(data.get("fee_home")),
    fee_relay: Number(data.get("fee_relay")),
    free_above: Number(data.get("free_above")),
    delivery_days_home: data.get("delivery_days_home"),
    home_delivery: data.get("home_delivery") === "on",
    relay_available: data.get("relay_available") === "on",
    active: data.get("active") === "on",
    updated_at: new Date().toISOString(),
  }).eq("code", code);
  revalidatePath("/admin/wilayas");
}

async function bulkActivate(active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("wilaya_config").update({ active }).neq("code", "00");
  revalidatePath("/admin/wilayas");
}

async function bulkSetFee(fee: number) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("wilaya_config").update({ fee_home: fee }).neq("code", "00");
  revalidatePath("/admin/wilayas");
}

export default async function AdminWilayas() {
  const supabase = createAdminClient();
  const { data: wilayas } = await supabase
    .from("wilaya_config")
    .select("*")
    .order("code");

  const active = (wilayas ?? []).filter((w) => w.active).length;
  const total = (wilayas ?? []).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wilayas & Tarifs</h1>
          <p className="text-sm text-gray-500 mt-1">{active}/{total} wilayas actives</p>
        </div>
      </div>

      {/* Actions bulk */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-medium text-gray-800 mb-4">Actions en masse</h2>
        <div className="flex flex-wrap gap-3">
          <form action={async () => { "use server"; await bulkActivate(true); }}>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
              ✓ Activer toutes
            </button>
          </form>
          <form action={async () => { "use server"; await bulkActivate(false); }}>
            <button type="submit" className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
              ✗ Désactiver toutes
            </button>
          </form>
          <form className="flex items-center gap-2"
            action={async (fd: FormData) => {
              "use server";
              await bulkSetFee(Number(fd.get("fee")));
            }}>
            <input name="fee" type="number" placeholder="Tarif domicile DZD" defaultValue={500}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            <button type="submit" className="px-4 py-2 bg-[#18534F] text-white text-sm rounded-lg hover:bg-[#0f3d3a] transition-colors">
              Appliquer à toutes
            </button>
          </form>
        </div>
      </div>

      {/* Tableau wilayas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 text-left">Code</th>
                <th className="px-3 py-3 text-left">Wilaya</th>
                <th className="px-3 py-3 text-center">Actif</th>
                <th className="px-3 py-3 text-center">Domicile</th>
                <th className="px-3 py-3 text-center">Relais</th>
                <th className="px-3 py-3 text-right">Frais dom.</th>
                <th className="px-3 py-3 text-right">Frais relais</th>
                <th className="px-3 py-3 text-right">Livr. offerte</th>
                <th className="px-3 py-3 text-left">Délai dom.</th>
                <th className="px-3 py-3 text-center">Sauvegarder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(wilayas ?? []).map((w) => (
                <tr key={w.code} className={`hover:bg-gray-50 ${!w.active ? "opacity-50" : ""}`}>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">{w.code}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{w.name}</td>
                  <form action={async (fd: FormData) => { "use server"; await updateWilaya(w.code, fd); }}>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" name="active" defaultChecked={w.active}
                        className="h-4 w-4 rounded accent-[#18534F]" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" name="home_delivery" defaultChecked={w.home_delivery}
                        className="h-4 w-4 rounded accent-[#18534F]" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" name="relay_available" defaultChecked={w.relay_available}
                        className="h-4 w-4 rounded accent-[#18534F]" />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input type="number" name="fee_home" defaultValue={w.fee_home} min={0}
                        className="w-20 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#18534F]/50" />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input type="number" name="fee_relay" defaultValue={w.fee_relay} min={0}
                        className="w-20 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#18534F]/50" />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input type="number" name="free_above" defaultValue={w.free_above} min={0}
                        className="w-24 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#18534F]/50" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" name="delivery_days_home" defaultValue={w.delivery_days_home}
                        className="w-28 border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#18534F]/50" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button type="submit" className="text-xs text-[#18534F] hover:underline font-medium">
                        ✓ Sauv.
                      </button>
                    </td>
                  </form>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
