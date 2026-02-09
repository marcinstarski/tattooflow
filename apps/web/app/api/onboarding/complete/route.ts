import { NextResponse } from "next/server";
import { requireSession } from "@/server/tenant";
import { prisma } from "@/server/db";
import { onboardingSchema } from "@inkflow/shared";

export async function POST(req: Request) {
  const session = await requireSession();
  const orgId = session.user.orgId as string;
  const userId = session.user.id as string | undefined;
  const userEmail = session.user.email as string | undefined;
  const body = await req.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: data.studioName,
      timezone: data.timezone
    }
  });

  const orConditions: Array<{ userId?: string; email?: string }> = [];
  if (userId) orConditions.push({ userId });
  if (userEmail) orConditions.push({ email: userEmail });

  const existingArtist = await prisma.artist.findFirst({
    where: {
      orgId,
      OR: orConditions.length ? orConditions : undefined
    }
  });

  if (existingArtist) {
    await prisma.artist.update({
      where: { id: existingArtist.id },
      data: {
        name: data.artistName,
        email: userEmail || existingArtist.email || undefined,
        userId: userId || existingArtist.userId || undefined
      }
    });
  } else {
    await prisma.artist.create({
      data: {
        orgId,
        userId: userId || undefined,
        name: data.artistName,
        email: userEmail
      }
    });
  }

  return NextResponse.json({ ok: true });
}
