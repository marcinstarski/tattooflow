import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";

export async function DELETE(req: Request, { params }: { params: { id: string; albumId: string } }) {
  const orgId = await requireOrgId();
  await prisma.clientAsset.updateMany({
    where: { orgId, clientId: params.id, albumId: params.albumId },
    data: { albumId: null }
  });
  await prisma.clientAlbum.deleteMany({
    where: { id: params.albumId, orgId, clientId: params.id }
  });
  return NextResponse.json({ ok: true });
}
