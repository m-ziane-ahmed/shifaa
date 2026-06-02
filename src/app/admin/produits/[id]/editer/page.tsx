import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { EditProduitClient } from "./EditProduitClient";

export const dynamic = "force-dynamic";

export default async function EditerProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: fournisseurs } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");

  return <EditProduitClient product={product} fournisseurs={fournisseurs ?? []} />;
}
