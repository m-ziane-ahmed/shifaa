import { SITE } from "@/lib/site";
import { formatDZD } from "@/lib/utils";

type LineItem = { name: string; quantity: number; price: number };

export function buildWhatsAppOrderUrl(items: LineItem[], note?: string) {
  const lines = [
    "Bonjour Shifaa, je souhaite commander :",
    "",
    ...items.map((i) => `• ${i.name} × ${i.quantity} — ${formatDZD(i.price * i.quantity)}`),
    "",
    note ? `Note : ${note}` : "",
    "Merci de me confirmer disponibilité et frais de livraison.",
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `${SITE.whatsappUrl}?text=${text}`;
}

export function buildWhatsAppProductUrl(productName: string, price: number, slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const text = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${productName} (${formatDZD(price)})\n${base}/produit/${slug}`
  );
  return `${SITE.whatsappUrl}?text=${text}`;
}
