import { prisma } from "@/server/db";
import { planFeatures } from "@/server/billing/plans";

const inactiveStatuses = new Set(["canceled", "incomplete_expired"]);

export type ArtistLimit = {
  base: number;
  extra: number;
  total: number;
  plan: "starter" | "pro" | "studio";
};

export async function getArtistLimit(orgId: string): Promise<ArtistLimit | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { seatSubscriptions: true }
  });
  if (!org) return null;
  const base = planFeatures[org.plan].artists;
  const extra = org.seatSubscriptions
    .filter((seat) => !inactiveStatuses.has(seat.status))
    .reduce((sum, seat) => sum + (seat.quantity || 0), 0);
  return { base, extra, total: base + extra, plan: org.plan };
}

