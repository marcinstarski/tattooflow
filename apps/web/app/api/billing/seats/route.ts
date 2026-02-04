import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, requireSession } from "@/server/tenant";
import { getArtistLimit } from "@/server/billing/limits";
import { createSeatCheckout } from "@/server/billing/stripe";

const SEAT_PRICE_PLN = 30;

export async function GET() {
  const orgId = await requireOrgId();
  const limit = await getArtistLimit(orgId);
  if (!limit) {
    return NextResponse.json({ error: "Brak organizacji" }, { status: 404 });
  }
  const used = await prisma.artist.count({ where: { orgId } });
  return NextResponse.json({
    ...limit,
    used,
    price: SEAT_PRICE_PLN,
    canAdd: used < limit.total
  });
}

export async function POST() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }
  const session = await requireSession();
  const email = session.user.email || "";
  const checkout = await createSeatCheckout(orgId, email);
  return NextResponse.json(checkout);
}
