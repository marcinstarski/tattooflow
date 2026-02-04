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

  await prisma.settings.upsert({
    where: { orgId },
    create: {
      orgId,
      depositType: data.depositType,
      depositValue: Math.round(data.depositValue),
      depositDueDays: data.depositDueDays,
      templateReminder: data.templateReminder,
      templateDeposit: data.templateDeposit,
      templateFollowUp: data.templateFollowUp
    },
    update: {
      depositType: data.depositType,
      depositValue: Math.round(data.depositValue),
      depositDueDays: data.depositDueDays,
      templateReminder: data.templateReminder,
      templateDeposit: data.templateDeposit,
      templateFollowUp: data.templateFollowUp
    }
  });

  if (body.appointmentDate && body.appointmentTime) {
    const startsAt = new Date(`${body.appointmentDate}T${body.appointmentTime}:00`);
    const endsAt = new Date(startsAt.getTime() + Number(body.appointmentDuration || 2) * 60 * 60 * 1000);
    const client = await prisma.client.create({
      data: {
        orgId,
        name: "Pierwszy klient",
        marketingOptIn: false
      }
    });
    await prisma.appointment.create({
      data: {
        orgId,
        clientId: client.id,
        artistId: artist.id,
        startsAt,
        endsAt,
        status: "scheduled"
      }
    });
  }

  return NextResponse.json({ ok: true });
}
