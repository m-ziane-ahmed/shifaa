import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fournisseurs | Admin Shifaa" };

async function createSupplier(fd: FormData) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("suppliers").insert({
    name: fd.get("name"),
    contact_name: fd.get("contact_name"),
    phone: fd.get("phone"),
    email: fd.get("email"),
    address: fd.get("address"),
    wilaya: fd.get("wilaya"),
    payment_terms: fd.get("payment_terms"),
    notes: fd.get("notes"),
  });
  revalidatePath("/admin/fournisseurs");
}

async function toggleSupplier(id: string, active: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("suppliers").update({ active }).eq("id", id);
  revalidatePath("/admin/fournisseurs");
}

async function deleteSupplier(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("suppliers").delete().eq("id", id);
  revalidatePath("/admin/fournisseurs");
}

export default async function AdminFournisseurs({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*, products(count)")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-1">{(suppliers ?? []).length} fournisseur(s)</p>
        </div>
        <Link href="?show=form"
          className="bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors">
          + Nouveau fournisseur
        </Link>
      </div>

      {/* Formulaire création */}
      {params.show === "form" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-medium text-gray-900 mb-4">Nouveau fournisseur</h2>
          <form action={createSupplier} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Raison sociale *</label>
              <input name="name" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contact</label>
              <input name="contact_name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
              <input name="phone" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input name="email" type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Wilaya</label>
              <input name="wilaya" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Conditions paiement</label>
              <input name="payment_terms" defaultValue="30 jours"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Adresse</label>
              <input name="address" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Notes</label>
              <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30 resize-none" />
            </div>
            <div className="col-span-2 flex gap-3">
              <Link href="/admin/fournisseurs" className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors text-center">
                Annuler
              </Link>
              <button type="submit" className="flex-1 bg-[#18534F] text-white py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors">
                Créer le fournisseur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Fournisseur</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Wilaya</th>
              <th className="px-4 py-3 text-left">Paiement</th>
              <th className="px-4 py-3 text-center">Produits</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(suppliers ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Aucun fournisseur. <Link href="?show=form" className="text-[#18534F] hover:underline">Ajouter le premier →</Link>
                </td>
              </tr>
            )}
            {(suppliers ?? []).map((s) => (
              <tr key={s.id} className={`hover:bg-gray-50 ${!s.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{s.name}</p>
                  {s.email && <p className="text-xs text-gray-400">{s.email}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.contact_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{s.wilaya ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{s.payment_terms}</td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {(s.products as { count: number }[])?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-3 text-center">
                  <form action={async () => { "use server"; await toggleSupplier(s.id, !s.active); }}>
                    <button type="submit"
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.active ? "Actif" : "Inactif"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-center">
                  <form action={async () => { "use server"; await deleteSupplier(s.id); }}>
                    <button type="submit" className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
