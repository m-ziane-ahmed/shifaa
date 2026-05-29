export const FREE_SHIPPING_THRESHOLD = 8000;
export const DEFAULT_DELIVERY_FEE = 450;

export type AppliedPromo = {
  code: string;
  discount: number;
  freeDelivery: boolean;
  label: string;
};

export function validatePromoCode(code: string, subtotal: number): AppliedPromo | null {
  const normalized = code.trim().toUpperCase();
  if (normalized === "BIENVENUE10") {
    return {
      code: normalized,
      discount: Math.round(subtotal * 0.1),
      freeDelivery: false,
      label: "−10 % bienvenue",
    };
  }
  if (normalized === "LIVRAISON0") {
    return {
      code: normalized,
      discount: 0,
      freeDelivery: true,
      label: "Livraison offerte",
    };
  }
  return null;
}

export function calcDeliveryFee(subtotal: number, promo?: AppliedPromo | null) {
  if (promo?.freeDelivery || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return DEFAULT_DELIVERY_FEE;
}

export function calcCartTotals(subtotal: number, promo?: AppliedPromo | null) {
  const discount = promo?.discount ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const delivery = subtotal > 0 ? calcDeliveryFee(afterDiscount, promo) : 0;
  return {
    subtotal,
    discount,
    delivery,
    total: afterDiscount + delivery,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
