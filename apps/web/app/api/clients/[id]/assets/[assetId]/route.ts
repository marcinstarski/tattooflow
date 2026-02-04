import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import path from "path";

function getAppRoot() {
  const cwd = process.cwd();
  const suffix = path.join("apps", "web");
  return cwd.endsWith(suffix) ? cwd : path.join(cwd, suffix);
}

export async function DELETE(req: Request, { params }: { params: { id: string; assetId: string } }) {
  const orgId = await requireOrgId();
  const asset = await prisma.clientAsset.findFirst({
    where: { id: params.assetId, orgId, clientId: params.id }
  });
  if (asset?.url?.startsWith("/uploads/")) {
    const filePath = asset.url.replace("/uploads/", "");
    const absolutePath = path.join(getAppRoot(), "public/uploads", filePath);
    try {
      await (await import("fs/promises")).unlink(absolutePath);
    } catch {
      // ignore
    }
  }
  await prisma.clientAsset.deleteMany({
    where: { id: params.assetId, orgId, clientId: params.id }
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string; assetId: string } }) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const albumId = (body.albumId as string | null | undefined) || null;
  await prisma.clientAsset.updateMany({
    where: { id: params.assetId, orgId, clientId: params.id },
    data: { albumId }
  });
  return NextResponse.json({ ok: true });
}
