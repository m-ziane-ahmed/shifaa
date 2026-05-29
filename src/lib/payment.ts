import { v4 as uuid } from "uuid";
import { readStore, updateStore } from "@/lib/db";

export type PaymentSession = {
  token: string;
  orderId: string;
  method: "cib" | "edahabia";
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
};

const FILE = "payment-sessions.json";

export function createPaymentSession(orderId: string, method: "cib" | "edahabia", amount: number) {
  const session: PaymentSession = {
    token: uuid(),
    orderId,
    method,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  updateStore<PaymentSession[]>(FILE, [], (list) => [session, ...list.filter((s) => s.orderId !== orderId)]);
  return session;
}

export function getPaymentSession(token: string) {
  return readStore<PaymentSession[]>(FILE, []).find((s) => s.token === token);
}

export function completePaymentSession(token: string, success: boolean) {
  updateStore<PaymentSession[]>(FILE, [], (list) =>
    list.map((s) =>
      s.token === token ? { ...s, status: success ? "paid" : "failed" } : s
    )
  );
}

/** URL passerelle Satim/CIB — en prod : SATIM_GATEWAY_URL depuis le portail marchand */
export function getSatimRedirectUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const gateway = process.env.SATIM_GATEWAY_URL;
  if (gateway) {
    return `${gateway}?token=${token}&returnUrl=${encodeURIComponent(`${base}/api/payment/callback`)}`;
  }
  return `${base}/commande/paiement/simulation?token=${token}`;
}

export { PAYMENT_LABELS } from "@/lib/payment-labels";
