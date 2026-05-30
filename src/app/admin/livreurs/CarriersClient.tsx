"use client";

import { useState } from "react";
import { CarrierForm } from "./CarrierForm";
import { formatDZD } from "@/lib/utils";

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

export function CarriersClient({
  carriers,
  deleteCarrier,
}: {
  carriers: Carrier[];
  deleteCarrier: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Carrier | undefined>();

  return (
    <>
      {(showForm || editing) && (
        <CarrierForm
          carrier={editing}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors"
        >
          + Nouveau livreur
        </button>
      </div>

      {carriers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🚚</p>
          <p className="text-gray-500">Aucun livreur enregistré.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 bg-[#18534F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0f3d3a] transition-colors">
            Ajouter le premier livreur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carriers.map((c) => (
            <div key={c.id} className={`bg-white rounded-xl border p-5 ${!c.active ? "opacity-60 border-gray-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  {!c.active && <span className="text-xs text-red-500">Inactif</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(c)}
                    className="text-xs text-[#18534F] hover:underline">Modifier</button>
                  <form action={async () => { await deleteCarrier(c.id); }}>
                    <button type="submit" className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </form>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                {c.phone && <p>📞 {c.phone}</p>}
                {c.email && <p>✉️ {c.email}</p>}
                <p>🏠 Domicile : <span className="font-medium">{formatDZD(c.fee_home)}</span></p>
                <p>📍 Relais : <span className="font-medium">{formatDZD(c.fee_relay)}</span></p>
                {c.zones?.length > 0 && (
                  <p className="text-xs text-gray-400">
                    Wilayas : {c.zones.slice(0, 8).join(", ")}{c.zones.length > 8 ? ` +${c.zones.length - 8}` : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
