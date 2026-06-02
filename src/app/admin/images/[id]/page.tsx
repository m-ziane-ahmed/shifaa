"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Upload, Trash2, Star, GripVertical, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

type ProductImage = {
  url: string;
  path: string;
  isMain: boolean;
  order: number;
};

type Product = { id: string; name: string; brand: string; slug: string; images: string[] };

export default function GererImagesPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/produits/${productId}`);
    const data = await res.json();
    const p = data.product;
    if (!p) return;
    setProduct(p);
    const imgs = (p.images ?? []).map((url: string, i: number) => ({
      url,
      path: url.split("/").pop() ?? "",
      isMain: i === 0,
      order: i,
    }));
    setImages(imgs);
    setLoading(false);
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  async function uploadFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true); setError("");
    const uploaded: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round((i / files.length) * 100));

      // Validation
      if (file.size > 2 * 1024 * 1024) {
        setError(`${file.name} dépasse 2MB`); continue;
      }
      if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
        setError(`${file.name} : format non supporté`); continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setError(`Erreur upload ${file.name}: ${uploadError.message}`); continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      uploaded.push({
        url: urlData.publicUrl,
        path,
        isMain: false,
        order: images.length + uploaded.length,
      });
    }

    if (uploaded.length > 0) {
      setImages((prev) => {
        const newImgs = [...prev, ...uploaded];
        if (newImgs.length === uploaded.length) newImgs[0].isMain = true;
        return newImgs;
      });
    }
    setUploading(false);
    setUploadProgress(0);
  }

  async function deleteImage(index: number) {
    const img = images[index];
    if (!confirm("Supprimer cette image ?")) return;

    // Supprimer du storage
    await supabase.storage.from("product-images").remove([img.path]);

    setImages((prev) => {
      const newImgs = prev.filter((_, i) => i !== index);
      if (img.isMain && newImgs.length > 0) newImgs[0].isMain = true;
      return newImgs.map((m, i) => ({ ...m, order: i }));
    });
  }

  function setMain(index: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === index })));
  }

  async function saveImages() {
    setSaving(true); setError("");
    try {
      // Trier par ordre et mettre l'image principale en premier
      const sorted = [...images].sort((a, b) => {
        if (a.isMain) return -1;
        if (b.isMain) return 1;
        return a.order - b.order;
      });
      const urls = sorted.map((img) => img.url);

      const res = await fetch(`/api/admin/produits/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: urls }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  if (loading) return <div className="p-8 text-gray-400 text-center">Chargement…</div>;
  if (!product) return <div className="p-8 text-red-500">Produit introuvable</div>;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/produits" className="hover:text-shifaa-green">Produits</Link>
            <span>›</span>
            <Link href={`/admin/produits/${productId}`} className="hover:text-shifaa-green">{product.name}</Link>
            <span>›</span>
            <span>Images</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Gérer les images</h1>
          <p className="text-sm text-gray-500">{product.brand} · {images.length} image{images.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/produits/${productId}`}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <button onClick={saveImages} disabled={saving || images.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-shifaa-green text-white rounded-lg text-sm hover:bg-shifaa-dark disabled:opacity-50">
            {success ? <><CheckCircle className="h-4 w-4" /> Sauvegardé !</> : saving ? "Enregistrement…" : "Enregistrer l'ordre"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Zone upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors
          ${dragOver ? "border-shifaa-green bg-shifaa-green/5" : "border-gray-200 hover:border-shifaa-green hover:bg-gray-50"}`}>
        <Upload className={`h-10 w-10 ${dragOver ? "text-shifaa-green" : "text-gray-300"}`} />
        <div className="text-center">
          <p className="font-medium text-gray-700">
            {uploading ? `Upload en cours… ${uploadProgress}%` : "Glissez vos images ici"}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 2 MB · Plusieurs fichiers acceptés</p>
        </div>
        {uploading && (
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-shifaa-green rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          multiple className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {/* Grille images */}
      {images.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-medium text-gray-700">Aucune image</p>
          <p className="text-sm text-gray-400 mt-1">Glissez des images dans la zone ci-dessus pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, index) => (
            <div key={img.url + index}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all
                ${img.isMain ? "border-shifaa-green shadow-md" : "border-gray-200 hover:border-gray-300"}`}>

              {/* Image */}
              <div className="aspect-square bg-gray-50 relative">
                <Image src={img.url} alt={`Image ${index + 1}`} fill className="object-cover" sizes="200px" />
              </div>

              {/* Badge principale */}
              {img.isMain && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-shifaa-green text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Star className="h-2.5 w-2.5 fill-current" /> Principale
                </div>
              )}

              {/* Actions au hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isMain && (
                  <button onClick={() => setMain(index)} title="Définir comme principale"
                    className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-shifaa-green hover:text-white transition-colors">
                    <Star className="h-3.5 w-3.5" /> Principale
                  </button>
                )}
                <button onClick={() => deleteImage(index)} title="Supprimer"
                  className="flex items-center justify-center h-8 w-8 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Numéro ordre */}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}

          {/* Bouton ajouter */}
          <div onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-shifaa-green hover:bg-gray-50 transition-colors">
            <Upload className="h-8 w-8 text-gray-300" />
            <span className="text-xs text-gray-400">Ajouter</span>
          </div>
        </div>
      )}

      {/* Légende */}
      {images.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 <strong>Astuce :</strong> Passez la souris sur une image pour la définir comme principale (affichée en premier sur le site) ou la supprimer. Cliquez sur &quot;Enregistrer l&apos;ordre&quot; pour sauvegarder les modifications.
          </p>
        </div>
      )}
    </div>
  );
}
