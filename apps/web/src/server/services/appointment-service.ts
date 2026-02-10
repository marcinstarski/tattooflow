import { prisma } from "@/server/db";
import { getQueues } from "@/server/jobs/queues";
import { subHours } from "date-fns";

export async function checkConflict(params: { orgId: string; artistId: string; startsAt: Date; endsAt: Date }) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      orgId: params.orgId,
      artistId: params.artistId,
      OR: [
        {
          startsAt: { lt: params.endsAt },
          endsAt: { gt: params.startsAt }
        }
      ]
    }
  });
  return Boolean(conflict);
}

export async function createAppointment(params: {
  orgId: string;
  clientId: string;
  artistId: string;
  startsAt: Date;
  endsAt: Date;
  description?: string;
  price?: number;
  depositRequired?: boolean;
  depositAmount?: number;
  depositDueAt?: Date;
  depositStatus?: "none" | "pending" | "paid" | "expired";
  depositPaidAt?: Date;
}) {
  const conflict = await checkConflict(params);
  if (conflict) {
    throw new Error("Konflikt w kalendarzu");
  }

  const appointment = await prisma.appointment.create({
    data: {
      orgId: params.orgId,
      clientId: params.clientId,
      artistId: params.artistId,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      description: params.description,
      price: params.price ? Math.round(params.price) : undefined,
      depositRequired: params.depositRequired ?? false,
      depositAmount: params.depositAmount ? Math.round(params.depositAmount) : undefined,
      depositDueAt: params.depositDueAt,
      depositStatus: params.depositStatus,
      depositPaidAt: params.depositPaidAt
    }
  });

  await scheduleAppointmentReminders(appointment.id, params.orgId, params.startsAt);

  return appointment;
}

export async function scheduleAppointmentReminders(appointmentId: string, orgId: string, startsAt: Date) {
  const reminder24h = subHours(startsAt, 24);

  const reminderRecord = await prisma.reminder.create({
    data: {
      orgId,
      appointmentId,
      type: "appointment_24h",
      channel: "sms",
      sendAt: reminder24h
    }
  });

  const queues = getQueues();
  if (queues) {
    await queues.reminderQueue.add(
      "appointment_reminder",
      { appointmentId, orgId },
      { delay: Math.max(0, reminder24h.getTime() - Date.now()) }
    );
  }

  return reminderRecord;
}
