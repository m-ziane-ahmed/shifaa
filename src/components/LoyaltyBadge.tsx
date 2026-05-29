"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoyaltyBadge() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/loyalty")
      .then((r) => r.json())
      .then((d) => setPoints(d.points ?? 0));
  }, [user]);

  if (!user) return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-shifaa-lime/50 bg-shifaa-lime/15 p-4">
      <Gift className="h-8 w-8 text-shifaa-green" />
      <div>
        <p className="font-semibold text-shifaa-ink">{points} points fidélité</p>
        <p className="text-xs text-shifaa-muted">1 point pour chaque 100 DZD commandés</p>
      </div>
    </div>
  );
}
