import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  // Calcul score santé catalogue
  let score = 0;
  if (product.name?.length > 5) score += 15;
  if (product.short_description?.length > 20) score += 10;
  if (product.description?.length > 100) score += 15;
  if (product.images?.length > 0) score += 20;
  if (product.images?.length >= 3) score += 5;
  if (product.price > 0) score += 10;
  if (product.sku) score += 5;
  if (product.ingredients?.length > 10) score += 5;
  if (product.meta_title) score += 5;
  if (product.meta_description) score += 5;
  if (product.benefits?.length > 0) score += 5;
  score = Math.min(score, 100);

  const scoreColor = score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = score >= 80 ? "bg-green-50 border-green-200" : score >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  // Dernières modifications
  const { data: auditLog } = await supabase
    .from("product_audit_log")
    .select("field, new_value, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/produits" className="hover:text-shifaa-green">Produits</Link>
            <span>›</span>
            <span className="text-gray-700">{product.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.brand} · {CATEGORY_LABELS[product.category as ProductCategory]}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/produit/${product.slug}`} target="_blank"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Voir sur le site ↗
          </Link>
          <Link href={`/admin/produits/${id}/editer`}
            className="px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark">
            ✏️ Modifier
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Infos essentielles */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-gray-900 mb-4">Informations produit</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-gray-500">SKU</dt><dd className="font-medium text-gray-800">{product.sku ?? "—"}</dd>
              <dt className="text-gray-500">Barcode</dt><dd className="font-medium text-gray-800">{product.barcode ?? "—"}</dd>
              <dt className="text-gray-500">Prix vente</dt><dd className="font-medium text-shifaa-green">{formatDZD(product.price)}</dd>
              <dt className="text-gray-500">Prix barré</dt><dd className="text-gray-400 line-through">{product.compare_at_price ? formatDZD(product.compare_at_price) : "—"}</dd>
              <dt className="text-gray-500">Prix d&apos;achat</dt><dd className="font-medium">{product.cost_price ? formatDZD(product.cost_price) : "—"}</dd>
              <dt className="text-gray-500">Marge brute</dt>
              <dd className="font-medium text-green-600">
                {product.cost_price ? `${Math.round(((product.price - product.cost_price) / product.price) * 100)}%` : "—"}
              </dd>
              <dt className="text-gray-500">Stock</dt>
              <dd className={`font-bold ${product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
                {product.stock} unités
              </dd>
              <dt className="text-gray-500">Statut</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${product.status === "published" ? "bg-green-100 text-green-700" :
                    product.status === "draft" ? "bg-gray-100 text-gray-600" :
                    "bg-red-100 text-red-600"}`}>
                  {product.status === "published" ? "Publié" : product.status === "draft" ? "Brouillon" : "Archivé"}
                </span>
              </dd>
              <dt className="text-gray-500">Note clients</dt>
              <dd className="font-medium">⭐ {product.rating} ({product.review_count} avis)</dd>
            </div>
          </div>

          {/* Description */}
          {product.short_description && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{product.short_description}</p>
              {product.description && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-4">{product.description}</p>
              )}
            </div>
          )}

          {/* Bénéfices */}
          {product.benefits?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-medium text-gray-900 mb-3">Bénéfices</h2>
              <ul className="space-y-1">
                {product.benefits.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-shifaa-green mt-0.5">✓</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-gray-900 mb-3">Filtres & Tags</h2>
            <div className="flex flex-wrap gap-2">
              {product.need && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{product.need}</span>}
              {product.age_group && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">{product.age_group}</span>}
              {product.gender && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{product.gender}</span>}
              {product.is_bio && <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">Bio</span>}
              {product.is_vegan && <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">Vegan</span>}
              {product.is_new && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Nouveau</span>}
              {product.is_best_seller && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Best-seller</span>}
              {(product.skin_type ?? []).map((s: string) => (
                <span key={s} className="px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">

          {/* Score santé catalogue */}
          <div className={`rounded-xl border p-5 ${scoreBg}`}>
            <h3 className="font-medium text-gray-900 mb-3">Score santé catalogue</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-gray-400 mb-1">/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full transition-all
                ${score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }} />
            </div>
            <ul className="space-y-1 text-xs">
              {[
                { ok: product.name?.length > 5, label: "Nom renseigné" },
                { ok: product.short_description?.length > 20, label: "Description courte" },
                { ok: product.description?.length > 100, label: "Description complète" },
                { ok: product.images?.length > 0, label: "Au moins 1 image" },
                { ok: product.images?.length >= 3, label: "3+ images" },
                { ok: !!product.sku, label: "SKU renseigné" },
                { ok: !!product.meta_title, label: "Titre SEO" },
                { ok: !!product.meta_description, label: "Meta description" },
                { ok: product.benefits?.length > 0, label: "Bénéfices listés" },
                { ok: !!product.ingredients, label: "Composition INCI" },
              ].map(({ ok, label }) => (
                <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-gray-600" : "text-gray-400"}`}>
                  <span>{ok ? "✅" : "⬜"}</span>{label}
                </li>
              ))}
            </ul>
          </div>

          {/* Audit trail */}
          {(auditLog ?? []).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3 text-sm">Historique modifications</h3>
              <ul className="space-y-2">
                {auditLog!.map((log, i) => (
                  <li key={i} className="text-xs text-gray-500 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-gray-700">{log.field}</span>
                    <br />{new Date(log.created_at).toLocaleDateString("fr-DZ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Actions rapides</h3>
            <Link href={`/admin/produits/${id}/editer`}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              ✏️ Modifier le produit
            </Link>
            <Link href={`/admin/produits/${id}/variantes`}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              📦 Gérer les variantes
            </Link>
            <Link href={`/admin/images/${id}`}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              🖼️ Gérer les images
            </Link>
            <Link href={`/produit/${product.slug}`} target="_blank"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              👁️ Voir sur le site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
