import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { getQueues } from "@/server/jobs/queues";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const reminder = await prisma.reminder.create({
    data: {
      orgId,
      appointmentId: body.appointmentId,
      type: "manual",
      channel: body.channel || "sms",
      sendAt: body.sendAt ? new Date(body.sendAt) : new Date()
    }
  });

  const queues = getQueues();
  if (!queues) {
    return NextResponse.json({ error: "Kolejki niedostępne" }, { status: 503 });
  }
  await queues.reminderQueue.add(
    "appointment_reminder",
    { appointmentId: body.appointmentId, orgId },
    { delay: Math.max(0, reminder.sendAt.getTime() - Date.now()) }
  );

  return NextResponse.json(reminder);
}
