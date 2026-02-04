import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("hub.challenge");
  return new Response(challenge || "", { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("[META WEBHOOK]", JSON.stringify(body));

  if (body?.entry?.length) {
    const entry = body.entry[0];
    const message = entry?.messaging?.[0]?.message?.text;
    const sender = entry?.messaging?.[0]?.sender?.id;
    const orgId = entry?.orgId;
    const clientId = entry?.clientId;

    if (message && orgId && clientId) {
      await prisma.message.create({
        data: {
          orgId,
          clientId,
          direction: "inbound",
          channel: "facebook",
          body: message,
          externalId: sender
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
