import { createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Avis clients | Admin Shifaa" };

async function approveReview(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  const { data } = await supabase.from("reviews").select("product_id, rating").eq("id", id).single();
  if (data) {
    const { data: agg } = await supabase.from("reviews").select("rating")
      .eq("product_id", data.product_id).eq("status", "approved");
    if (agg && agg.length > 0) {
      const avg = agg.reduce((s, r) => s + Number(r.rating), 0) / agg.length;
      await supabase.from("products")
        .update({ rating: Math.round(avg * 10) / 10, review_count: agg.length })
        .eq("id", data.product_id);
    }
  }
  revalidatePath("/admin/avis");
}

async function rejectReview(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("reviews").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/avis");
}

async function deleteReview(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/avis");
}

const STARS = (n: number) => Array.from({ length: 5 }, (_, i) =>
  <span key={i} className={i < n ? "text-amber-400" : "text-gray-200"}>★</span>
);

export default async function AdminAvis({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const status = params.status ?? "pending";

  let query = supabase
    .from("reviews")
    .select("*, products(name, slug, images)")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data: reviews } = await query;

  // Compteurs par statut
  const { data: allReviews } = await supabase.from("reviews").select("status");
  const counts = (allReviews ?? []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const TABS = [
    { value: "pending",  label: "En attente",  cls: "bg-amber-100 text-amber-700" },
    { value: "approved", label: "Approuvés",   cls: "bg-green-100 text-green-700" },
    { value: "rejected", label: "Rejetés",     cls: "bg-red-100 text-red-700" },
    { value: "all",      label: "Tous",        cls: "bg-gray-100 text-gray-600" },
  ];

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {(counts.pending ?? 0)} en attente · {(counts.approved ?? 0)} approuvés · Note moy. {avgRating}/5
          </p>
        </div>
        {(counts.pending ?? 0) > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <span className="text-amber-600 text-sm font-medium">⏳ {counts.pending} avis à modérer</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <Link key={t.value} href={`?status=${t.value}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all
              ${status === t.value ? "bg-shifaa-green text-white border-shifaa-green shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            {t.label}
            {counts[t.value] !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                ${status === t.value ? "bg-white/20" : t.cls}`}>
                {t.value === "all" ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[t.value] ?? 0)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Liste avis */}
      {(reviews ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium text-gray-700">Aucun avis dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(reviews ?? []).map((r) => {
            const product = r.products as { name: string; slug: string; images: string[] } | null;
            return (
              <div key={r.id} className={`bg-white rounded-2xl border p-5 transition-all
                ${r.status === "pending" ? "border-amber-200 shadow-sm" : "border-gray-200"}`}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0 h-10 w-10 rounded-full bg-shifaa-green/10 flex items-center justify-center text-sm font-bold text-shifaa-green">
                    {(r.author || "?")[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{r.author}</span>
                      <span className="flex text-sm">{STARS(r.rating ?? 0)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${r.status === "approved" ? "bg-green-100 text-green-700"
                          : r.status === "rejected" ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"}`}>
                        {r.status === "approved" ? "✓ Approuvé" : r.status === "rejected" ? "✗ Rejeté" : "⏳ En attente"}
                      </span>
                    </div>

                    {/* Produit */}
                    {product && (
                      <Link href={`/produit/${product.slug}`} target="_blank"
                        className="text-xs text-shifaa-green hover:underline mb-2 block">
                        📦 {product.name} ↗
                      </Link>
                    )}

                    {/* Commentaire */}
                    {r.title && <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>}
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-2">
                    {r.status === "pending" && (<>
                      <form action={async () => { "use server"; await approveReview(r.id); }}>
                        <button type="submit"
                          className="w-full px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition font-medium">
                          ✓ Approuver
                        </button>
                      </form>
                      <form action={async () => { "use server"; await rejectReview(r.id); }}>
                        <button type="submit"
                          className="w-full px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition font-medium">
                          ✗ Rejeter
                        </button>
                      </form>
                    </>)}
                    <form action={async () => { "use server"; await deleteReview(r.id); }}>
                      <button type="submit"
                        className="w-full px-3 py-1.5 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-50 transition">
                        🗑️ Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
