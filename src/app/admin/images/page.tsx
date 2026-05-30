import Image from "next/image";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Images | Admin Shifaa" };

export default async function AdminImages() {
  const supabase = createAdminClient();

  // Produits avec nombre d'images
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, brand, category, images")
    .eq("is_active", true)
    .order("name")
    .limit(50);

  const { data: productImages } = await supabase
    .from("product_images")
    .select("product_id, count:id")
    .order("product_id");

  const imgCountMap: Record<string, number> = {};
  for (const pi of productImages ?? []) {
    imgCountMap[pi.product_id] = (imgCountMap[pi.product_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Images produits</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les images de vos produits</p>
        </div>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 mb-6 text-center">
        <p className="text-3xl mb-3">🖼️</p>
        <h2 className="font-medium text-gray-800 mb-1">Upload d&apos;images en masse</h2>
        <p className="text-sm text-gray-500 mb-4">
          Faites glisser vos images ici, ou utilisez le bouton ci-dessous.<br />
          Formats acceptés : JPG, PNG, WebP — max 2 MB par image
        </p>
        <ImageUploadClient products={products ?? []} />
      </div>

      {/* Grille produits */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Produits et leurs images</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {(products ?? []).map((p) => {
            const imgs = (p.images as string[]) ?? [];
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                {/* Miniatures */}
                <div className="flex gap-1.5 shrink-0">
                  {imgs.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                  ))}
                  {imgs.length === 0 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                      —
                    </div>
                  )}
                </div>
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand} · {p.category} · {imgs.length} image(s)</p>
                </div>
                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <a href={`/admin/images/${p.id}`}
                    className="text-xs text-[#18534F] hover:underline border border-[#18534F]/20 px-2 py-1 rounded-lg">
                    Gérer →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Composant client pour upload
function ImageUploadClient({ products }: { products: Array<{ id: string; name: string; brand: string }> }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-gray-400">
        Sélectionnez le produit cible puis uploadez les images
      </p>
      <div className="flex gap-3 items-center">
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30 min-w-64">
          <option value="">-- Sélectionner un produit --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
          ))}
        </select>
        <label className="bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors cursor-pointer">
          Choisir des images
          <input type="file" accept="image/*" multiple className="hidden" />
        </label>
      </div>
      <p className="text-xs text-amber-600">
        ⚠ L&apos;upload vers Supabase Storage sera disponible après configuration du bucket &quot;product-images&quot;
      </p>
    </div>
  );
}
