import { NextResponse } from "next/server";
import { requireOrgId, requireUserId, requireRole, getArtistId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { leadCreateSchema } from "@inkflow/shared";
import { upsertLead } from "@/server/services/lead-service";
import { logAudit } from "@/server/utils/audit";

export async function GET(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json([]);
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const leads = await prisma.lead.findMany({
    where: { orgId, status: status as any, artistId: artistId || undefined },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const userId = await requireUserId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  const body = await req.json();
  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const lead = await upsertLead({
    orgId,
    artistId: artistId || undefined,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    igHandle: parsed.data.igHandle,
    source: parsed.data.source,
    message: parsed.data.message
  });
  await logAudit({
    orgId,
    actorId: userId,
    action: "lead_created",
    entity: "Lead",
    entityId: lead.lead.id
  });
  return NextResponse.json(lead.lead);
}
