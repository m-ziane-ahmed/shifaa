import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { CarriersClient } from "./CarriersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Livreurs | Admin Shifaa" };

async function deleteCarrier(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("carriers").delete().eq("id", id);
  revalidatePath("/admin/livreurs");
}

export default async function AdminLivreurs() {
  const supabase = createAdminClient();
  const { data: carriers } = await supabase
    .from("carriers")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Livreurs</h1>
          <p className="text-sm text-gray-500 mt-1">{(carriers ?? []).length} livreur(s) enregistré(s)</p>
        </div>
      </div>
      <CarriersClient carriers={carriers ?? []} deleteCarrier={deleteCarrier} />
    </div>
  );
}
