import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const url = body.url as string | undefined;
  const note = body.note as string | undefined;
  const source = (body.source as string | undefined) || "client";

  if (!url) {
    return NextResponse.json({ error: "Brak URL" }, { status: 400 });
  }

  const asset = await prisma.clientAsset.create({
    data: {
      orgId,
      clientId: params.id,
      url,
      note,
      source
    }
  });

  return NextResponse.json(asset);
}
