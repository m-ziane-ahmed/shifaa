import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Avis | Admin Shifaa" };

async function approveReview(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  // Mettre à jour rating produit
  const { data } = await supabase.from("reviews").select("product_id, rating").eq("id", id).single();
  if (data) {
    const { data: agg } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", data.product_id)
      .eq("status", "approved");
    if (agg && agg.length > 0) {
      const avg = agg.reduce((s, r) => s + Number(r.rating), 0) / agg.length;
      await supabase.from("products")
        .update({ rating: Math.round(avg * 10) / 10, review_count: agg.length })
        .eq("id", data.product_id);
    }
  }
  revalidatePath("/admin/avis");
}

async function deleteReview(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/avis");
}

export default async function AdminAvis({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("reviews")
    .select("*, products(name, slug)")
    .order("created_at", { ascending: false });

  if (params.status !== "all") query = query.eq("status", params.status ?? "pending");

  const { data: reviews } = await query;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Avis clients</h1>

      <div className="flex gap-2 mb-4">
        {[
          { value: "pending", label: "En attente" },
          { value: "approved", label: "Approuvés" },
          { value: "all", label: "Tous" },
        ].map((t) => (
          <a key={t.value} href={`?status=${t.value}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors
              ${(params.status ?? "pending") === t.value
                ? "bg-shifaa-green text-white border-transparent"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {(reviews ?? []).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Aucun avis dans cette catégorie.
          </div>
        )}
        {(reviews ?? []).map((r) => {
          const product = r.products as { name: string; slug: string } | null;
          return (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{r.author}</span>
                    <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status === "approved" ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                  {product && (
                    <p className="text-xs text-shifaa-green mb-2">
                      <a href={`/produit/${product.slug}`} target="_blank" className="hover:underline">
                        {product.name}
                      </a>
                    </p>
                  )}
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString("fr-DZ")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.status === "pending" && (
                    <form action={async () => { "use server"; await approveReview(r.id); }}>
                      <button type="submit" className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                        ✓ Approuver
                      </button>
                    </form>
                  )}
                  <form action={async () => { "use server"; await deleteReview(r.id); }}>
                    <button type="submit" className="px-3 py-1.5 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors">
                      ✕ Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
