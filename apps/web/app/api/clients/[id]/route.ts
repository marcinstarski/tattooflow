import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";
import path from "path";

function getAppRoot() {
  const cwd = process.cwd();
  const suffix = path.join("apps", "web");
  return cwd.endsWith(suffix) ? cwd : path.join(cwd, suffix);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  if (role === "artist") {
    const allowed = await prisma.client.findFirst({
      where: {
        id: params.id,
        orgId,
        OR: [
          { appointments: { some: { artistId } } },
          { leads: { some: { artistId } } },
          { messages: { some: { artistId } } }
        ]
      }
    });
    if (!allowed) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }
  }
  const body = await req.json();
  const updated = await prisma.client.updateMany({
    where: { id: params.id, orgId },
    data: body
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  return NextResponse.json(client);
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const artistId = role === "artist" ? await getArtistId() : null;
  if (role === "artist" && !artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      orgId,
      ...(artistId
        ? {
            OR: [
              { appointments: { some: { artistId } } },
              { leads: { some: { artistId } } },
              { messages: { some: { artistId } } }
            ]
          }
        : {})
    },
    include: {
      appointments: {
        where: artistId ? { artistId } : undefined,
        include: { artist: true },
        orderBy: { startsAt: "desc" }
      },
      messages: {
        where: artistId ? { artistId } : undefined,
        orderBy: { createdAt: "desc" }
      },
      assets: { orderBy: { createdAt: "desc" } },
      albums: { orderBy: { createdAt: "asc" } }
    }
  });
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }
  const client = await prisma.client.findFirst({ where: { id: params.id, orgId } });
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const assets = await prisma.clientAsset.findMany({
    where: { orgId, clientId: params.id }
  });

  await Promise.all(
    assets
      .filter((asset: { url: string }) => asset.url.startsWith("/uploads/"))
      .map(async (asset: { url: string }) => {
        const filePath = asset.url.replace("/uploads/", "");
        const absolutePath = path.join(getAppRoot(), "public/uploads", filePath);
        try {
          await (await import("fs/promises")).unlink(absolutePath);
        } catch {
          // ignore
        }
      })
  );

  const appointments = await prisma.appointment.findMany({
    where: { orgId, clientId: params.id },
    select: { id: true }
  });
  const appointmentIds = appointments.map((appt: { id: string }) => appt.id);

  await prisma.$transaction([
    prisma.reminder.deleteMany({ where: { orgId, appointmentId: { in: appointmentIds } } }),
    prisma.message.deleteMany({ where: { orgId, clientId: params.id } }),
    prisma.campaignSend.deleteMany({ where: { clientId: params.id } }),
    prisma.lead.deleteMany({ where: { orgId, clientId: params.id } }),
    prisma.clientAsset.deleteMany({ where: { orgId, clientId: params.id } }),
    prisma.clientAlbum.deleteMany({ where: { orgId, clientId: params.id } }),
    prisma.appointment.deleteMany({ where: { orgId, clientId: params.id } }),
    prisma.client.deleteMany({ where: { id: params.id, orgId } })
  ]);

  return NextResponse.json({ ok: true });
}
