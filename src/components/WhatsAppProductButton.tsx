"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppProductUrl } from "@/lib/whatsapp";

export function WhatsAppProductButton({
  name,
  price,
  slug,
}: {
  name: string;
  price: number;
  slug: string;
}) {
  const href = buildWhatsAppProductUrl(name, price, slug);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary inline-flex items-center justify-center gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Commander sur WhatsApp
    </a>
  );
}
