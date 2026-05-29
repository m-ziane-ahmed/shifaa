import type { ProductCategory } from "@/lib/types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  loyaltyPoints?: number;
}

export interface AddressRecord {
  id: string;
  userId: string;
  label: string;
  wilaya: string;
  commune: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  promoCode?: string;
  delivery: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "cod_pending";
  paymentRef?: string;
  deliveryMode: "home" | "relay";
  wilaya: string;
  commune: string;
  address: string;
  payment: "cod" | "cib" | "edahabia";
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  productId: string;
  userId?: string;
  author: string;
  rating: number;
  comment: string;
  status: "pending" | "approved";
  createdAt: string;
}

export interface ResetTokenRecord {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

export interface ReturnRequestRecord {
  id: string;
  userId: string;
  orderId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const PRODUCT_NEEDS = [
  "hydratation",
  "anti-âge",
  "purifiant",
  "apaisant",
  "fortifiant",
  "protection solaire",
  "nutrition",
  "détente",
] as const;

export type ProductNeed = (typeof PRODUCT_NEEDS)[number];

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  category: ProductCategory;
}
