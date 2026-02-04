import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { verifyInstagramSignature } from "@/server/integrations/instagram";

type InstagramAttachment = { payload?: { url?: string } | null };
type InstagramMessage = { mid?: string; text?: string; attachments?: InstagramAttachment[] };
type InstagramMessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: InstagramMessage;
};
type InstagramEntry = { id?: string; messaging?: InstagramMessagingEvent[] };
type InstagramWebhookPayload = { entry?: InstagramEntry[] };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyInstagramSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: InstagramWebhookPayload | null = null;
  try {
    body = JSON.parse(rawBody) as InstagramWebhookPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!body?.entry?.length) {
    return NextResponse.json({ ok: true });
  }

  for (const entry of body.entry) {
    const events = entry.messaging || [];
    for (const event of events) {
      const message = event.message;
      if (!message) continue;

      const senderId = event.sender?.id as string | undefined;
      const recipientId = event.recipient?.id as string | undefined;
      const messageText = message.text as string | undefined;
      const attachments = message.attachments || [];
      const mid = message.mid as string | undefined;

      if (!senderId) continue;

      const conditions: Array<{ igBusinessAccountId?: string; pageId?: string }> = [];
      if (recipientId) {
        conditions.push({ igBusinessAccountId: recipientId });
        conditions.push({ pageId: recipientId });
      }
      if (entry.id) {
        conditions.push({ igBusinessAccountId: entry.id });
        conditions.push({ pageId: entry.id });
      }
      if (conditions.length === 0) continue;

      const integration = await prisma.artistIntegration.findFirst({
        where: { OR: conditions }
      });

      if (!integration) continue;

      const orgId = integration.orgId;
      const artistId = integration.artistId;
      const isInstagram = Boolean(
        integration.igBusinessAccountId &&
          (recipientId === integration.igBusinessAccountId || entry.id === integration.igBusinessAccountId)
      );
      const isFacebook = Boolean(
        integration.pageId && (recipientId === integration.pageId || entry.id === integration.pageId)
      );
      const channel = isInstagram ? "instagram" : "facebook";
      const assetSource = isInstagram ? "instagram" : "facebook";

      let client = await prisma.client.findFirst({
        where: isInstagram ? { orgId, igUserId: senderId } : { orgId, fbUserId: senderId }
      });

      if (!client) {
        const shortId = senderId.slice(-4);
        client = await prisma.client.create({
          data: {
            orgId,
            name: `${isInstagram ? "Instagram" : "Facebook"} klient ${shortId}`,
            igUserId: isInstagram ? senderId : undefined,
            fbUserId: isFacebook ? senderId : undefined,
            marketingOptIn: false
          }
        });
      }

      if (mid) {
        const existing = await prisma.message.findFirst({
          where: { orgId, externalId: mid }
        });
        if (existing) continue;
      }

      const bodyText =
        messageText || (attachments.length ? `Załącznik z ${isInstagram ? "Instagrama" : "Facebooka"}` : "");
      if (bodyText) {
        await prisma.message.create({
          data: {
            orgId,
            clientId: client.id,
            artistId,
            direction: "inbound",
            channel,
            body: bodyText,
            externalId: mid
          }
        });
      }

      for (const attachment of attachments) {
        const url = attachment.payload?.url;
        if (!url) continue;
        await prisma.clientAsset.create({
          data: {
            orgId,
            clientId: client.id,
            url,
            source: assetSource
          }
        });
      }

      await prisma.lead.create({
        data: {
          orgId,
          artistId,
          name: client.name,
          email: client.email,
          phone: client.phone,
          igHandle: client.igHandle,
          source: channel,
          status: "new",
          message: messageText || undefined,
          clientId: client.id
        }
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({ ok: true });
}
