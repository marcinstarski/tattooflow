import { NextResponse } from "next/server";
import { appointmentCreateSchema } from "@inkflow/shared";
import { requireOrgId, requireUserId, requireRole, getArtistId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { createAppointment } from "@/server/services/appointment-service";
import { logAudit } from "@/server/utils/audit";

export async function GET(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  const currentArtistId = role === "artist" ? await getArtistId() : null;
  const url = new URL(req.url);
  const artistId = role === "artist" ? currentArtistId || undefined : (url.searchParams.get("artistId") || undefined);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (role === "artist" && !artistId) {
    return NextResponse.json([]);
  }

  const where: any = { orgId };
  if (artistId) {
    where.artistId = artistId;
  }
  if (from || to) {
    where.startsAt = {};
    if (from) where.startsAt.gte = new Date(from);
    if (to) where.startsAt.lte = new Date(to);
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { client: true, artist: true },
    orderBy: { startsAt: "asc" }
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const userId = await requireUserId();
  const role = await requireRole();
  const currentArtistId = role === "artist" ? await getArtistId() : null;
  const body = await req.json();
  const parsed = appointmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (role === "artist" && !currentArtistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  try {
    const settings = await prisma.settings.findUnique({ where: { orgId } });
    let depositAmount = parsed.data.depositAmount ?? 0;
    if (!depositAmount && settings) {
      const price = parsed.data.price || 0;
      if (settings.depositType === "percent") {
        depositAmount = Math.round((price * (settings.depositValue || 0)) / 100);
      } else {
        depositAmount = settings.depositValue || 0;
      }
    }
    const depositRequired = Boolean(parsed.data.depositRequired || depositAmount > 0);
    const depositPaid = Boolean(parsed.data.depositPaid) && depositRequired;
    const depositStatus = depositPaid ? "paid" : depositRequired ? "pending" : "none";
    const depositPaidAt = depositPaid ? new Date() : undefined;
    let depositDueAt: Date | undefined;
    if (depositRequired) {
      if (parsed.data.depositDueAt) {
        depositDueAt = new Date(parsed.data.depositDueAt);
      } else if (settings?.depositDueDays !== undefined) {
        depositDueAt = new Date();
        depositDueAt.setDate(depositDueAt.getDate() + Math.max(settings.depositDueDays, 0));
      }
    }
    const appointment = await createAppointment({
      orgId,
      clientId: parsed.data.clientId,
      artistId: role === "artist" ? (currentArtistId as string) : parsed.data.artistId,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      description: parsed.data.description,
      price: parsed.data.price,
      depositRequired,
      depositAmount: depositRequired ? depositAmount : undefined,
      depositDueAt,
      depositStatus,
      depositPaidAt
    });
    await logAudit({
      orgId,
      actorId: userId,
      action: "appointment_created",
      entity: "Appointment",
      entityId: appointment.id
    });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
