import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId, getArtistId } from "@/server/tenant";
import { isDevMode } from "@/server/env";
import { sendMetaMessage } from "@/server/integrations/meta-messaging";

const schema = z.object({
  channel: z.enum(["instagram", "facebook"]),
  body: z.string().min(1)
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

  const lead = await prisma.lead.findFirst({ where: { id: params.id, orgId } });
  if (!lead) {
    return NextResponse.json({ error: "Brak leada" }, { status: 404 });
  }

  const client = lead.clientId
    ? await prisma.client.findFirst({ where: { id: lead.clientId, orgId } })
    : await prisma.client.findFirst({
        where: {
          orgId,
          OR: [
            lead.email ? { email: lead.email } : undefined,
            lead.phone ? { phone: lead.phone } : undefined,
            lead.igHandle ? { igHandle: lead.igHandle } : undefined
          ].filter((item): item is { email?: string; phone?: string; igHandle?: string } => Boolean(item))
        }
      });

  if (!client) {
    return NextResponse.json({ error: "Brak powiązanego klienta" }, { status: 400 });
  }

  const channel = parsed.data.channel;
  const recipientId = channel === "instagram" ? client.igUserId : client.fbUserId;
  if (!recipientId) {
    return NextResponse.json({ error: "Brak wątku IG/FB dla tego leada" }, { status: 400 });
  }

  const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });
  if (!integration?.pageAccessToken) {
    if (!isDevMode) {
      return NextResponse.json({ error: "Brak połączenia Meta" }, { status: 400 });
    }
  }

  let externalId: string | undefined;
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

  await prisma.message.create({
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

  return NextResponse.json({ ok: true });
}
