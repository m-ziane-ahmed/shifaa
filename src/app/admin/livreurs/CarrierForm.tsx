"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Carrier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  zones: string[];
  fee_home: number;
  fee_relay: number;
  active: boolean;
  notes: string;
};

export function CarrierForm({ carrier, onClose }: { carrier?: Carrier; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<string>(carrier?.zones?.join(", ") ?? "");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      zones: zones.split(",").map((z) => z.trim()).filter(Boolean),
      fee_home: Number(fd.get("fee_home")),
      fee_relay: Number(fd.get("fee_relay")),
      active: fd.get("active") === "on",
      notes: fd.get("notes") as string,
    };
    if (carrier?.id) {
      await supabase.from("carriers").update(data).eq("id", carrier.id);
    } else {
      await supabase.from("carriers").insert(data);
    }
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">{carrier ? "Modifier le livreur" : "Nouveau livreur"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom *</label>
              <input name="name" defaultValue={carrier?.name} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
              <input name="phone" defaultValue={carrier?.phone}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input name="email" type="email" defaultValue={carrier?.email}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Frais domicile (DZD)</label>
              <input name="fee_home" type="number" defaultValue={carrier?.fee_home ?? 500} min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Frais relais (DZD)</label>
              <input name="fee_relay" type="number" defaultValue={carrier?.fee_relay ?? 350} min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" name="active" id="active" defaultChecked={carrier?.active ?? true}
                className="h-4 w-4 rounded accent-[#18534F]" />
              <label htmlFor="active" className="text-sm text-gray-700">Actif</label>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Wilayas couvertes (codes séparés par virgules)</label>
            <input value={zones} onChange={(e) => setZones(e.target.value)}
              placeholder="16, 09, 31, 25..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea name="notes" defaultValue={carrier?.notes} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18534F]/30 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#18534F] text-white py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors disabled:opacity-50">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
