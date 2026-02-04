import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, getArtistId } from "@/server/tenant";

export async function POST() {
  const orgId = await requireOrgId();
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  await prisma.artistIntegration.upsert({
    where: { artistId },
    update: {
      status: "disconnected",
      orgId,
      artistId,
      userAccessToken: null,
      userTokenExpiresAt: null,
      pageId: null,
      pageName: null,
      pageAccessToken: null,
      igBusinessAccountId: null,
      connectedAt: null
    },
    create: {
      orgId,
      artistId,
      status: "disconnected"
    }
  });

  return NextResponse.json({ ok: true });
}
