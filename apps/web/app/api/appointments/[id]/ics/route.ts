import { prisma } from "@/server/db";
import { requireOrgId } from "@/server/tenant";

function toICSDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, orgId },
    include: { client: true }
  });
  if (!appointment) {
    return new Response("Not found", { status: 404 });
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TaFlo//CRM//PL",
    "BEGIN:VEVENT",
    `UID:${appointment.id}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(appointment.startsAt)}`,
    `DTEND:${toICSDate(appointment.endsAt)}`,
    `SUMMARY:Wizyta - ${appointment.client.name}`,
    appointment.description ? `DESCRIPTION:${appointment.description}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename=appointment-${appointment.id}.ics`
    }
  });
}
