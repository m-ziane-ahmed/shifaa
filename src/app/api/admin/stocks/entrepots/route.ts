import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("warehouses").select("*").order("name");
  return NextResponse.json({ warehouses: data ?? [] });
}
