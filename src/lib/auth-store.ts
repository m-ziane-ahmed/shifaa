import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { readStore, updateStore, writeStore } from "@/lib/db";
import type {
  AddressRecord,
  OrderRecord,
  ResetTokenRecord,
  ReturnRequestRecord,
  ReviewRecord,
  UserRecord,
} from "@/lib/store-types";

const USERS_FILE = "users.json";
const ORDERS_FILE = "orders.json";
const ADDRESSES_FILE = "addresses.json";
const REVIEWS_FILE = "reviews.json";
const TOKENS_FILE = "reset-tokens.json";
const RETURNS_FILE = "returns.json";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function getUsers(): UserRecord[] {
  return readStore<UserRecord[]>(USERS_FILE, []);
}

export function findUserByEmail(email: string) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
  return getUsers().find((u) => u.id === id);
}

export async function createUser(email: string, password: string, name: string) {
  if (findUserByEmail(email)) throw new Error("EMAIL_EXISTS");
  const user: UserRecord = {
    id: uuid(),
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    name,
    createdAt: new Date().toISOString(),
  };
  updateStore<UserRecord[]>(USERS_FILE, [], (users) => [...users, user]);
  return user;
}

export function getOrders(userId?: string) {
  const orders = readStore<OrderRecord[]>(ORDERS_FILE, []);
  return userId ? orders.filter((o) => o.userId === userId) : orders;
}

export function createOrder(order: OrderRecord) {
  updateStore<OrderRecord[]>(ORDERS_FILE, [], (orders) => [order, ...orders]);
  return order;
}

export function findOrderById(orderId: string) {
  return readStore<OrderRecord[]>(ORDERS_FILE, []).find((o) => o.id === orderId);
}

export function trackOrder(orderId: string, email: string) {
  const order = findOrderById(orderId);
  if (!order) return null;
  const normalized = email.toLowerCase();
  if (order.guestEmail?.toLowerCase() === normalized) return order;
  const user = findUserById(order.userId);
  if (!user || user.email.toLowerCase() !== normalized) return null;
  return order;
}

export function updateOrder(id: string, patch: Partial<OrderRecord>) {
  updateStore<OrderRecord[]>(ORDERS_FILE, [], (orders) =>
    orders.map((o) => (o.id === id ? { ...o, ...patch } : o))
  );
}

export function addLoyaltyPoints(userId: string, points: number) {
  if (userId === "guest" || points <= 0) return;
  updateStore<UserRecord[]>(USERS_FILE, [], (users) =>
    users.map((u) =>
      u.id === userId ? { ...u, loyaltyPoints: (u.loyaltyPoints ?? 0) + points } : u
    )
  );
}

export function getLoyaltyPoints(userId: string) {
  return findUserById(userId)?.loyaltyPoints ?? 0;
}

export function getAddresses(userId: string) {
  return readStore<AddressRecord[]>(ADDRESSES_FILE, []).filter((a) => a.userId === userId);
}

export function saveAddress(address: AddressRecord) {
  updateStore<AddressRecord[]>(ADDRESSES_FILE, [], (list) => {
    const filtered = list.filter((a) => a.id !== address.id);
    if (address.isDefault) {
      return [...filtered.map((a) => (a.userId === address.userId ? { ...a, isDefault: false } : a)), address];
    }
    return [...filtered, address];
  });
  return address;
}

export function deleteAddress(id: string, userId: string) {
  updateStore<AddressRecord[]>(ADDRESSES_FILE, [], (list) =>
    list.filter((a) => !(a.id === id && a.userId === userId))
  );
}

export function getReviews(productId?: string, approvedOnly = true) {
  let reviews = readStore<ReviewRecord[]>(REVIEWS_FILE, []);
  if (productId) reviews = reviews.filter((r) => r.productId === productId);
  if (approvedOnly) reviews = reviews.filter((r) => r.status === "approved");
  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPendingReviews() {
  return readStore<ReviewRecord[]>(REVIEWS_FILE, []).filter((r) => r.status === "pending");
}

export function createReview(review: ReviewRecord) {
  updateStore<ReviewRecord[]>(REVIEWS_FILE, [], (list) => [review, ...list]);
  return review;
}

export function moderateReview(id: string, status: "approved" | "rejected") {
  updateStore<ReviewRecord[]>(REVIEWS_FILE, [], (list) =>
    list.map((r) => (r.id === id ? { ...r, status: status === "approved" ? "approved" : "pending" } : r))
  );
  if (status === "rejected") {
    updateStore<ReviewRecord[]>(REVIEWS_FILE, [], (list) => list.filter((r) => r.id !== id));
  }
}

export function createResetToken(userId: string, email: string) {
  const token = uuid();
  const record: ResetTokenRecord = {
    token,
    userId,
    email,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
  const tokens = readStore<ResetTokenRecord[]>(TOKENS_FILE, []).filter(
    (t) => t.userId !== userId
  );
  writeStore(TOKENS_FILE, [...tokens, record]);
  return record;
}

export function consumeResetToken(token: string) {
  const tokens = readStore<ResetTokenRecord[]>(TOKENS_FILE, []);
  const found = tokens.find((t) => t.token === token);
  if (!found || new Date(found.expiresAt) < new Date()) return null;
  writeStore(
    TOKENS_FILE,
    tokens.filter((t) => t.token !== token)
  );
  return found;
}

export async function updateUserPassword(userId: string, password: string) {
  const hash = await hashPassword(password);
  updateStore<UserRecord[]>(USERS_FILE, [], (users) =>
    users.map((u) => (u.id === userId ? { ...u, passwordHash: hash } : u))
  );
}

export function getReturns(userId: string) {
  return readStore<ReturnRequestRecord[]>(RETURNS_FILE, []).filter((r) => r.userId === userId);
}

export function createReturnRequest(req: ReturnRequestRecord) {
  updateStore<ReturnRequestRecord[]>(RETURNS_FILE, [], (list) => [req, ...list]);
  return req;
}

/** Avis de démo pour le catalogue */
export function seedReviewsIfEmpty(productIds: string[]) {
  const existing = readStore<ReviewRecord[]>(REVIEWS_FILE, []);
  if (existing.length > 0) return;
  const samples = [
    "Produit conforme à la description, livraison rapide.",
    "Très satisfait, je recommande.",
    "Bon rapport qualité-prix.",
    "Texture agréable, usage quotidien.",
    "Correspond à mes attentes.",
  ];
  const authors = ["Amira K.", "Karim B.", "Salma M.", "Yacine T.", "Nadia R."];
  const reviews: ReviewRecord[] = [];
  productIds.slice(0, 120).forEach((productId, i) => {
    const count = 2 + (i % 3);
    for (let j = 0; j < count; j++) {
      reviews.push({
        id: uuid(),
        productId,
        author: authors[(i + j) % authors.length],
        rating: 3 + ((i + j) % 3),
        comment: samples[(i + j) % samples.length],
        status: "approved",
        createdAt: new Date(Date.now() - (i * 86400000 + j * 3600000)).toISOString(),
      });
    }
  });
  writeStore(REVIEWS_FILE, reviews);
}
