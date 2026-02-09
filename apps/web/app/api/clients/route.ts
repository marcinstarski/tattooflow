import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";

export async function GET() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const clients = await prisma.client.findMany({
    where: {
      orgId,
      ...(artistId
        ? {
            OR: [
              { appointments: { some: { artistId } } },
              { leads: { some: { artistId } } },
              { messages: { some: { artistId } } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      orgId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      igHandle: body.igHandle,
      marketingOptIn: body.marketingOptIn ?? false,
      notes: body.notes
    }
  });
  if (artistId) {
    await prisma.lead.create({
      data: {
        orgId,
        artistId,
        clientId: client.id,
        name: client.name,
        email: client.email || undefined,
        phone: client.phone || undefined,
        igHandle: client.igHandle || undefined,
        source: "manual",
        status: "new"
      }
    });
  }
  return NextResponse.json(client);
}
