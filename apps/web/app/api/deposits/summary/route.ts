import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";

export async function GET(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "Brak clientId" }, { status: 400 });
  }

  const now = new Date();
  const whereBase = {
    orgId,
    clientId,
    ...(artistId ? { artistId } : {}),
    OR: [{ depositRequired: true }, { depositAmount: { gt: 0 } }]
  };

  const upcoming = await prisma.appointment.findFirst({
    where: {
      ...whereBase,
      startsAt: { gte: now }
    },
    orderBy: { startsAt: "asc" }
  });

  const appointment = upcoming
    || (await prisma.appointment.findFirst({
      where: whereBase,
      orderBy: { startsAt: "desc" }
    }));

  if (!appointment) {
    return NextResponse.json({ hasDeposit: false });
  }

  return NextResponse.json({
    hasDeposit: true,
    appointmentId: appointment.id,
    amount: appointment.depositAmount || 0,
    status: appointment.depositStatus,
    startsAt: appointment.startsAt
  });
}
