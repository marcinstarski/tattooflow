import { NextResponse } from "next/server";
import { requireSession } from "@/server/tenant";
import { prisma } from "@/server/db";
import { onboardingSchema } from "@inkflow/shared";

export async function POST(req: Request) {
  const body = await req.json();
  const token = typeof body?.token === "string" ? body.token : "";
  let orgId: string | null = null;
  let userId: string | undefined;
  let userEmail: string | undefined;

  if (token) {
    const tokenRecord = await prisma.onboardingToken.findUnique({
      where: { token },
      include: { org: true, user: true }
    });
    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    orgId = tokenRecord.orgId;
    userId = tokenRecord.userId;
    userEmail = tokenRecord.user.email;
  } else {
    const session = await requireSession();
    orgId = session.user.orgId as string;
    userId = session.user.id as string | undefined;
    userEmail = session.user.email as string | undefined;
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  await prisma.organization.update({
    where: { id: orgId as string },
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
      orgId: orgId as string,
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
        orgId: orgId as string,
        userId: userId || undefined,
        name: data.artistName,
        email: userEmail
      }
    });
  }

  return NextResponse.json({ ok: true });
}
