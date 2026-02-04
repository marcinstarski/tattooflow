import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/tenant";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional()
});

export async function GET() {
  const session = await requireSession();
  const orgId = session.user.orgId as string;
  const userId = session.user.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Brak użytkownika" }, { status: 400 });
  }
  const artist = await prisma.artist.findFirst({ where: { orgId, userId } });
  if (!artist) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 404 });
  }
  return NextResponse.json(artist);
}

export async function PATCH(req: Request) {
  const session = await requireSession();
  const orgId = session.user.orgId as string;
  const userId = session.user.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Brak użytkownika" }, { status: 400 });
  }
  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }
  const artist = await prisma.artist.findFirst({ where: { orgId, userId } });
  if (!artist) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 404 });
  }
  const updated = await prisma.artist.update({
    where: { id: artist.id },
    data: parsed.data
  });
  return NextResponse.json(updated);
}
