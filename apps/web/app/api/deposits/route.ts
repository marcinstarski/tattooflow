import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";

export async function GET() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json([]);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      orgId,
      ...(artistId ? { artistId } : {}),
      OR: [{ depositRequired: true }, { depositAmount: { gt: 0 } }]
    },
    include: { client: true, artist: true },
    orderBy: { startsAt: "asc" }
  });

  return NextResponse.json(appointments);
}
