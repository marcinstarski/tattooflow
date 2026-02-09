import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId, getArtistId, requireRole } from "@/server/tenant";
import { isDevMode } from "@/server/env";
import { sendMetaMessage } from "@/server/integrations/meta-messaging";

const schema = z.object({
  channel: z.enum(["instagram", "facebook"]),
  body: z.string().min(1)
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
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
  if (lead.artistId && lead.artistId !== artistId && role === "artist") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }
  if (!lead.artistId && role === "artist") {
    return NextResponse.json({ error: "Lead nie jest przypisany" }, { status: 400 });
  }

  let client = lead.clientId
    ? await prisma.client.findFirst({ where: { id: lead.clientId, orgId } })
    : null;

  if (!client) {
    const orConditions: Array<{ email?: string; phone?: string; igHandle?: string }> = [];
    if (lead.email) orConditions.push({ email: lead.email });
    if (lead.phone) orConditions.push({ phone: lead.phone });
    if (lead.igHandle) orConditions.push({ igHandle: lead.igHandle });

    client = await prisma.client.findFirst({
      where: {
        orgId,
        OR: orConditions.length ? orConditions : undefined
      }
    });
  }

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
