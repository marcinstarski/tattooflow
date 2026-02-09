import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({
    where: { token: parsed.data.token }
  });
  if (!invite) {
    return NextResponse.json({ error: "Zaproszenie nie istnieje" }, { status: 404 });
  }
  if (invite.acceptedAt) {
    return NextResponse.json({ error: "Zaproszenie zostało użyte" }, { status: 410 });
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Zaproszenie wygasło" }, { status: 410 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
    include: { memberships: true }
  });

  if (existingUser?.passwordHash) {
    return NextResponse.json({ error: "Konto już istnieje" }, { status: 409 });
  }

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          name: existingUser.name || invite.name || invite.email
        }
      })
    : await prisma.user.create({
        data: {
          email: invite.email,
          passwordHash,
          name: invite.name || invite.email
        }
      });

  const membership = await prisma.membership.upsert({
    where: { orgId_userId: { orgId: invite.orgId, userId: user.id } },
    update: { role: invite.role },
    create: { orgId: invite.orgId, userId: user.id, role: invite.role }
  });

  if (invite.role === "artist") {
    const artistByEmail = await prisma.artist.findFirst({
      where: { orgId: invite.orgId, email: invite.email }
    });
    if (artistByEmail) {
      await prisma.artist.update({
        where: { id: artistByEmail.id },
        data: { userId: user.id }
      });
    } else {
      await prisma.artist.create({
        data: {
          orgId: invite.orgId,
          userId: user.id,
          name: invite.name || invite.email,
          email: invite.email
        }
      });
    }
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() }
  });

  return NextResponse.json({ ok: true, orgId: membership.orgId });
}
