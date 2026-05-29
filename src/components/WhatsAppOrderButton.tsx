"use client";

import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "primary" | "secondary";
  label?: string;
};

export function WhatsAppOrderButton({ className, variant = "secondary", label }: Props) {
  const { items } = useCart();
  const lines = items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }));
  const href =
    lines.length > 0
      ? buildWhatsAppOrderUrl(lines)
      : `${SITE.whatsappUrl}?text=${encodeURIComponent("Bonjour Shifaa, j'ai une question sur vos produits.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        variant === "primary" ? "btn-primary" : "btn-secondary",
        "inline-flex items-center justify-center gap-2",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label ?? "Commander sur WhatsApp"}
    </a>
  );
}
