import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId, getArtistId } from "@/server/tenant";
import { isDevMode } from "@/server/env";
import { sendMetaMessage } from "@/server/integrations/meta-messaging";
import { sendEmail, sendSms } from "@/server/notifications";

const schema = z.object({
  clientId: z.string().min(1),
  body: z.string().min(1)
});

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const userId = await requireUserId();
  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, orgId }
  });
  if (!client) {
    return NextResponse.json({ error: "Brak klienta" }, { status: 404 });
  }

  const lastInbound = await prisma.message.findFirst({
    where: { orgId, clientId: client.id, direction: "inbound", artistId },
    orderBy: { createdAt: "desc" }
  });

  if (!lastInbound?.channel) {
    return NextResponse.json({ error: "Brak wiadomości przychodzącej" }, { status: 400 });
  }

  const channel = lastInbound.channel;
  let externalId: string | undefined;

  if (channel === "email") {
    if (!client.email) {
      return NextResponse.json({ error: "Brak adresu email klienta" }, { status: 400 });
    }
    const subject = `TaFlo: wiadomość od ${client.name}`;
    await sendEmail({
      orgId,
      to: client.email,
      subject,
      html: `<p>${parsed.data.body}</p>`
    });
  } else if (channel === "sms") {
    if (!client.phone) {
      return NextResponse.json({ error: "Brak numeru telefonu klienta" }, { status: 400 });
    }
    await sendSms({ orgId, to: client.phone, body: parsed.data.body });
  } else if (channel === "instagram" || channel === "facebook") {
    const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });
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

    const recipientId = channel === "instagram" ? client.igUserId : client.fbUserId;
    if (!recipientId) {
      return NextResponse.json({ error: "Brak identyfikatora klienta" }, { status: 400 });
    }

    if (isDevMode || !integration?.pageAccessToken) {
      await prisma.outbox.create({
        data: {
          orgId,
          channel,
          to: recipientId,
          body: parsed.data.body
        }
      });
    } else {
      const result = await sendMetaMessage({
        channel,
        recipientId,
        text: parsed.data.body,
        pageAccessToken: integration.pageAccessToken,
        igBusinessAccountId: integration.igBusinessAccountId
      });
      externalId = result.message_id || result.id;
    }
  } else {
    return NextResponse.json({ error: "Nieobsługiwany kanał odpowiedzi" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      orgId,
      clientId: client.id,
      artistId,
      direction: "outbound",
      channel,
      body: parsed.data.body,
      userId: userId || undefined,
      externalId
    }
  });

  return NextResponse.json({ ok: true, message });
}
