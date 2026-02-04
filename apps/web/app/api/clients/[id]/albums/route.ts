import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const albums = await prisma.clientAlbum.findMany({
    where: { orgId, clientId: params.id },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(albums);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const name = body.name as string | undefined;
  if (!name) {
    return NextResponse.json({ error: "Brak nazwy albumu" }, { status: 400 });
  }
  const album = await prisma.clientAlbum.create({
    data: {
      orgId,
      clientId: params.id,
      name
    }
  });
  return NextResponse.json(album);
}
