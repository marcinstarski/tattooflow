import { NextResponse } from "next/server";
import { requireSession } from "@/server/tenant";
import { prisma } from "@/server/db";
import { onboardingSchema } from "@inkflow/shared";

export async function POST(req: Request) {
  const session = await requireSession();
  const orgId = session.user.orgId as string;
  const userId = session.user.id as string | undefined;
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

  const artist = await prisma.artist.create({
    data: {
      orgId,
      userId: userId || undefined,
      name: data.artistName,
      email: data.artistEmail,
      phone: data.artistPhone
    }
  });

  return NextResponse.json({ ok: true });
}
