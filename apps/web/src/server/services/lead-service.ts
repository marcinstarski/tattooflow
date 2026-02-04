import { prisma } from "@/server/db";
import type { LeadStatus } from "@prisma/client";

export async function findClientByContact(orgId: string, input: { email?: string | null; phone?: string | null; igHandle?: string | null }) {
  const { email, phone, igHandle } = input;
  return prisma.client.findFirst({
    where: {
      orgId,
      OR: [
        email ? { email } : undefined,
        phone ? { phone } : undefined,
        igHandle ? { igHandle } : undefined
      ].filter(Boolean) as Array<Record<string, string>>
    }
  });
}

export async function upsertLead(params: {
  orgId: string;
  artistId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  igHandle?: string | null;
  source: string;
  message?: string | null;
  status?: LeadStatus;
}) {
  const resolveArtistId = async () => {
    if (params.artistId) return params.artistId;
    const artists = await prisma.artist.findMany({
      where: { orgId: params.orgId },
      select: { id: true },
      take: 2
    });
    return artists.length === 1 ? artists[0].id : null;
  };

  const resolvedArtistId = await resolveArtistId();
  const hasContact = Boolean(params.email || params.phone || params.igHandle);
  const existingLead = hasContact
    ? await prisma.lead.findFirst({
        where: {
          orgId: params.orgId,
          OR: [
            params.email ? { email: params.email } : undefined,
            params.phone ? { phone: params.phone } : undefined,
            params.igHandle ? { igHandle: params.igHandle } : undefined
          ].filter(Boolean) as Array<Record<string, string>>
        }
      })
    : null;

  if (existingLead) {
    const updated = await prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        name: params.name,
        message: params.message || existingLead.message,
        source: params.source,
        status: params.status || existingLead.status,
        artistId: existingLead.artistId || resolvedArtistId || undefined
      }
    });
    const existingClient = updated.clientId
      ? await prisma.client.findUnique({ where: { id: updated.clientId } })
      : null;
    return { lead: updated, existingClient };
  }

  const existingClient = hasContact
    ? await findClientByContact(params.orgId, {
        email: params.email,
        phone: params.phone,
        igHandle: params.igHandle
      })
    : null;

  const lead = await prisma.lead.create({
    data: {
      orgId: params.orgId,
      artistId: resolvedArtistId || undefined,
      name: params.name,
      email: params.email,
      phone: params.phone,
      igHandle: params.igHandle,
      source: params.source,
      message: params.message || undefined,
      status: params.status || "new",
      clientId: existingClient?.id
    }
  });

  return { lead, existingClient };
}
