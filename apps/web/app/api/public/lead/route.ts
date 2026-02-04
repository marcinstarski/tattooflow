import { NextResponse } from "next/server";
import { leadCreateSchema } from "@inkflow/shared";
import { rateLimit } from "@/server/utils/rate-limit";
import { upsertLead } from "@/server/services/lead-service";
import { prisma } from "@/server/db";

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "*";
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ok = await rateLimit(`rl:lead:${ip}`, 20, 60);
    if (!ok) {
      return NextResponse.json({ error: "Rate limit" }, { status: 429, headers: corsHeaders(origin) });
    }

    const body = await req.json();
    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: corsHeaders(origin) });
    }

    const { honeypot, ...lead } = parsed.data;
    if (honeypot) {
      return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) });
    }

    const orgId = (body.orgId as string | undefined) || req.headers.get("x-org-id");
    if (!orgId) {
      return NextResponse.json({ error: "Brak orgId" }, { status: 400, headers: corsHeaders(origin) });
    }

    const created = await upsertLead({
      orgId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      igHandle: lead.igHandle,
      source: lead.source,
      message: lead.message
    });

    if (lead.marketingOptIn && created.existingClient) {
      await prisma.client.update({
        where: { id: created.existingClient.id },
        data: { marketingOptIn: true, unsubscribedAt: null }
      });
    }

    if (lead.marketingOptIn && !created.existingClient) {
      const client = await prisma.client.create({
        data: {
          orgId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          igHandle: lead.igHandle,
          marketingOptIn: true
        }
      });
      await prisma.lead.update({
        where: { id: created.lead.id },
        data: { clientId: client.id }
      });
    }

    return NextResponse.json({ ok: true, leadId: created.lead.id }, { headers: corsHeaders(origin) });
  } catch (error) {
    return NextResponse.json(
      { error: "Błąd serwera", detail: (error as Error).message },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Org-Id",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
