import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const body = await req.json();
  const updated = await prisma.lead.updateMany({
    where: { id: params.id, orgId, artistId: artistId || undefined },
    data: body
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  return NextResponse.json(lead);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  await prisma.lead.deleteMany({ where: { id: params.id, orgId, artistId: artistId || undefined } });
  return NextResponse.json({ ok: true });
}
