import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId, requireUserId } from "@/server/tenant";
import { createDepositCheckout } from "@/server/billing/stripe";
import { renderTemplate } from "@/server/templates/renderer";
import { sendEmail, sendSms } from "@/server/notifications";
import { sendMetaMessage } from "@/server/integrations/meta-messaging";
import { isDevMode } from "@/server/env";

const schema = z.object({
  appointmentId: z.string().optional(),
  clientId: z.string().optional(),
  channel: z.enum(["sms", "email", "instagram", "facebook"]).optional()
}).refine((data) => Boolean(data.appointmentId || data.clientId), {
  message: "Brak appointmentId lub clientId"
});

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const userId = await requireUserId();

  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  let appointment = parsed.data.appointmentId
    ? await prisma.appointment.findFirst({
        where: {
          id: parsed.data.appointmentId,
          orgId,
          ...(artistId ? { artistId } : {})
        },
        include: { client: true }
      })
    : await prisma.appointment.findFirst({
        where: {
          orgId,
          clientId: parsed.data.clientId,
          ...(artistId ? { artistId } : {}),
          OR: [{ depositRequired: true }, { depositAmount: { gt: 0 } }],
          depositStatus: { not: "paid" }
        },
        include: { client: true },
        orderBy: { startsAt: "asc" }
      });

  const settings = await prisma.settings.findUnique({ where: { orgId } });

  if (!appointment && parsed.data.clientId) {
    appointment = await prisma.appointment.findFirst({
      where: {
        orgId,
        clientId: parsed.data.clientId,
        ...(artistId ? { artistId } : {}),
        depositStatus: { not: "paid" }
      },
      include: { client: true },
      orderBy: { startsAt: "asc" }
    });

    if (appointment && settings) {
      const price = appointment.price || 0;
      let depositAmount = settings.depositValue || 0;
      if (settings.depositType === "percent") {
        depositAmount = Math.round((price * depositAmount) / 100);
      }
      if (depositAmount > 0) {
        const dueDays = settings.depositDueDays ?? 7;
        const depositDueAt = new Date();
        depositDueAt.setDate(depositDueAt.getDate() + Math.max(dueDays, 0));
        appointment = await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            depositRequired: true,
            depositAmount,
            depositDueAt,
            depositStatus: "pending"
          },
          include: { client: true }
        });
      }
    }
  }

  if (!appointment) {
    return NextResponse.json({ error: "Brak wizyty z zadatkiem" }, { status: 404 });
  }

  if (appointment.depositStatus === "paid") {
    return NextResponse.json({ error: "Zadatek jest już opłacony" }, { status: 409 });
  }

  const amount = appointment.depositAmount || 0;
  if (!amount) {
    return NextResponse.json({ error: "Brak kwoty zadatku" }, { status: 400 });
  }

  let depositLink = appointment.depositLink || undefined;
  if (!depositLink || appointment.depositStatus === "none") {
    const checkout = await createDepositCheckout({
      orgId,
      appointmentId: appointment.id,
      amount,
      clientEmail: appointment.client.email || undefined
    });
    depositLink = checkout.url;
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        depositStatus: "pending",
        depositLink
      }
    });
  }

  const body = renderTemplate(
    settings?.templateDeposit || "Cześć:) Podsyłam tutaj link do zadatku na naszą sesję: {{depositLink}}",
    {
      clientName: appointment.client.name,
      depositLink,
      appointmentDate: new Date(appointment.startsAt).toLocaleString("pl-PL")
    }
  );

  let channel = parsed.data.channel;
  if (!channel) {
    if (appointment.client.phone) channel = "sms";
    else if (appointment.client.email) channel = "email";
    else if (appointment.client.igUserId) channel = "instagram";
    else if (appointment.client.fbUserId) channel = "facebook";
  }

  if (!channel) {
    return NextResponse.json({ error: "Brak kanału wysyłki" }, { status: 400 });
  }

  let externalId: string | undefined;

  if (channel === "email") {
    const to = appointment.client.email;
    if (!to) return NextResponse.json({ error: "Brak adresu email" }, { status: 400 });
    await sendEmail({
      orgId,
      to,
      subject: "TaFlo: link do zadatku",
      html: `<p>${body}</p>`
    });
  }

  if (channel === "sms") {
    const to = appointment.client.phone;
    if (!to) return NextResponse.json({ error: "Brak numeru telefonu" }, { status: 400 });
    await sendSms({ orgId, to, body });
  }

  if (channel === "instagram" || channel === "facebook") {
    const recipientId =
      channel === "instagram" ? appointment.client.igUserId : appointment.client.fbUserId;
    if (!recipientId) {
      return NextResponse.json({ error: "Brak identyfikatora rozmówcy" }, { status: 400 });
    }

    const integration = artistId
      ? await prisma.artistIntegration.findUnique({ where: { artistId } })
      : null;

    if (!integration?.pageAccessToken) {
      if (!isDevMode) {
        return NextResponse.json({ error: "Brak połączenia Meta" }, { status: 400 });
      }
    }
    if (channel === "instagram" && !integration?.igBusinessAccountId) {
      if (!isDevMode) {
        return NextResponse.json({ error: "Brak połączonego konta Instagram" }, { status: 400 });
      }
    }

    if (isDevMode || !integration?.pageAccessToken) {
      await prisma.outbox.create({
        data: {
          orgId,
          channel,
          to: recipientId,
          body
        }
      });
    } else {
      const result = await sendMetaMessage({
        channel,
        recipientId,
        text: body,
        pageAccessToken: integration.pageAccessToken,
        igBusinessAccountId: integration.igBusinessAccountId
      });
      externalId = result.message_id || result.id;
    }
  }

  await prisma.message.create({
    data: {
      orgId,
      clientId: appointment.clientId,
      artistId: artistId || undefined,
      direction: "outbound",
      channel,
      body,
      userId: userId || undefined,
      externalId
    }
  });

  return NextResponse.json({ ok: true, depositLink, channel });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
