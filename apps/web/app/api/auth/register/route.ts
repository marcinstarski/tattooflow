import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, studioName } = body as { email?: string; password?: string; studioName?: string };

  if (!email || !password || !studioName) {
    return NextResponse.json({ error: "Brak danych" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Użytkownik już istnieje" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const org = await prisma.organization.create({
    data: {
      name: studioName,
      timezone: "Europe/Warsaw",
      currency: "PLN",
      plan: "starter",
      trialEndsAt
    }
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      memberships: {
        create: {
          orgId: org.id,
          role: "owner"
        }
      }
    }
  });

  return NextResponse.json({ ok: true, userId: user.id, orgId: org.id });
}
