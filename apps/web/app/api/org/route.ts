import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { z } from "zod";

export async function GET() {
  const orgId = await requireOrgId();
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  return NextResponse.json(org);
}

const orgUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  artistPhone: z.string().min(6).optional()
});

export async function PATCH(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const parsed = orgUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  if (parsed.data.name) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { name: parsed.data.name }
    });
  }

  if (parsed.data.artistPhone) {
    const artist = await prisma.artist.findFirst({
      where: { orgId },
      orderBy: { createdAt: "asc" }
    });
    if (artist) {
      await prisma.artist.update({
        where: { id: artist.id },
        data: { phone: parsed.data.artistPhone }
      });
    }
  }

  const updated = await prisma.organization.findUnique({ where: { id: orgId } });
  return NextResponse.json(updated);
}
