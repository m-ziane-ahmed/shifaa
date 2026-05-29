import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createReview, getPendingReviews, getReviews, moderateReview, seedReviewsIfEmpty } from "@/lib/auth-store";
import { getSession } from "@/lib/session";
import { PRODUCTS } from "@/data/products";
import type { ReviewRecord } from "@/lib/store-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const pending = searchParams.get("pending") === "1";

  seedReviewsIfEmpty(PRODUCTS.map((p) => p.id));

  if (pending) {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    return NextResponse.json({ reviews: getPendingReviews() });
  }

  if (!productId) {
    return NextResponse.json({ error: "productId requis." }, { status: 400 });
  }

  return NextResponse.json({ reviews: getReviews(productId, true) });
}

export async function POST(request: Request) {
  const session = await getSession();
  const body = await request.json();
  const { productId, rating, comment, author } = body;

  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const review: ReviewRecord = {
    id: uuid(),
    productId,
    userId: session.userId,
    author: session.name ?? author ?? "Client",
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  createReview(review);
  return NextResponse.json({
    ok: true,
    message: "Avis soumis — il sera publié après modération.",
    review,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id, action } = await request.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  moderateReview(id, action === "approve" ? "approved" : "rejected");
  return NextResponse.json({ ok: true });
}
