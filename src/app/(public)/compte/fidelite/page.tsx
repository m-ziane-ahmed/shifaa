"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LoyaltyDashboard } from "@/components/LoyaltyDashboard";
import { useAuth } from "@/context/AuthContext";

export default function FidelitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/compte?redirect=/compte/fidelite");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/loyalty").then((r) => r.json()).then((d) => setPoints(d.points ?? 0));
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6">
        <Breadcrumb items={[{ label: "Mon compte", href: "/compte" }, { label: "Fidélité & récompenses" }]} />
      </div>
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <h1 className="font-display text-2xl font-semibold text-shifaa-ink mb-6">
          Fidélité & récompenses
        </h1>
        <LoyaltyDashboard points={points} />
      </div>
    </>
  );
}
