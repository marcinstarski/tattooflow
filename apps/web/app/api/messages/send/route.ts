import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId, getArtistId } from "@/server/tenant";
import { sendEmail, sendSms } from "@/server/notifications";
import { isDevMode } from "@/server/env";
import { sendMetaMessage } from "@/server/integrations/meta-messaging";

const schema = z.object({
  clientId: z.string().min(1),
  channel: z.enum(["email", "sms", "instagram", "facebook"]),
  body: z.string().min(1),
  to: z.string().optional(),
  subject: z.string().optional()
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

  const client = await prisma.client.findFirst({ where: { id: parsed.data.clientId, orgId } });
  if (!client) {
    return NextResponse.json({ error: "Brak klienta" }, { status: 404 });
  }

  const channel = parsed.data.channel;
  let to = parsed.data.to;
  let externalId: string | undefined;

  if (channel === "email") {
    to = to || client.email || undefined;
    if (!to) {
      return NextResponse.json({ error: "Brak adresu email" }, { status: 400 });
    }
    const subject = parsed.data.subject || `InkFlow: wiadomość od ${client.name}`;
    await sendEmail({
      orgId,
      to,
      subject,
      html: `<p>${parsed.data.body}</p>`
    });
  }

  if (channel === "sms") {
    to = to || client.phone || undefined;
    if (!to) {
      return NextResponse.json({ error: "Brak numeru telefonu" }, { status: 400 });
    }
    await sendSms({ orgId, to, body: parsed.data.body });
  }

  if (channel === "instagram" || channel === "facebook") {
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

    to =
      to || (channel === "instagram" ? client.igUserId || undefined : client.fbUserId || undefined);
    if (!to) {
      return NextResponse.json({ error: "Brak identyfikatora rozmówcy" }, { status: 400 });
    }

    if (isDevMode || !integration?.pageAccessToken) {
      await prisma.outbox.create({
        data: {
          orgId,
          channel,
          to,
          body: parsed.data.body
        }
      });
    } else {
      const result = await sendMetaMessage({
        channel,
        recipientId: to,
        text: parsed.data.body,
        pageAccessToken: integration.pageAccessToken,
        igBusinessAccountId: integration.igBusinessAccountId
      });
      externalId = result.message_id || result.id;
    }
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
