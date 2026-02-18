import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  const body = await req.json();
  const clientId = body.clientId as string | undefined;
  if (!clientId) {
    return NextResponse.json({ error: "Brak klienta" }, { status: 400 });
  }

  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  if (role === "artist") {
    const allowed = await prisma.client.findFirst({
      where: {
        id: clientId,
        orgId,
        OR: [
          { appointments: { some: { artistId } } },
          { leads: { some: { artistId } } },
          { messages: { some: { artistId } } }
        ]
      }
    });
    if (!allowed) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }
  }

  await prisma.client.updateMany({
    where: { id: clientId, orgId },
    data: { lastConversationHandledAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
