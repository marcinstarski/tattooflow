import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId, requireRole, getArtistId } from "@/server/tenant";
import { messageCreateSchema } from "@inkflow/shared";

export async function GET() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;

  if (role === "artist" && !artistId) {
    return NextResponse.json([]);
  }

  const messages = await prisma.message.findMany({
    where: { orgId, ...(artistId ? { artistId } : {}) },
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const userId = await requireUserId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  const body = await req.json();
  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: {
      orgId,
      clientId: parsed.data.clientId,
      artistId: artistId || undefined,
      direction: parsed.data.direction,
      channel: parsed.data.channel,
      body: parsed.data.body,
      userId: parsed.data.direction === "outbound" ? userId : undefined
    }
  });
  return NextResponse.json(message);
}
