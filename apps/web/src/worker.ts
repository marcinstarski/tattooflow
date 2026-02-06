import { Worker } from "bullmq";
import { getRedisOptions } from "@/server/redis";
import { prisma } from "@/server/db";
import { sendEmail, sendSms } from "@/server/notifications";
import { renderTemplate } from "@/server/templates/renderer";
import { generateToken } from "@/server/utils/token";
import { reminderQueue, noReplyQueue, depositQueue, marketingQueue, dunningQueue } from "@/server/jobs/queues";
import { env } from "@/server/env";

const connection = getRedisOptions();

async function setupRepeatableJobs() {
  await noReplyQueue.add("scan", {}, { repeat: { every: 15 * 60 * 1000 } });
  await depositQueue.add("scan", {}, { repeat: { every: 60 * 60 * 1000 } });
  await dunningQueue.add("scan", {}, { repeat: { every: 6 * 60 * 60 * 1000 } });
}

setupRepeatableJobs().catch(console.error);

new Worker(
  "reminders",
  async (job) => {
    const { appointmentId, orgId } = job.data as { appointmentId: string; orgId: string };
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, orgId },
      include: { client: true }
    });
    if (!appointment) return;

    const settings = await prisma.settings.findUnique({ where: { orgId } });
    const reminders = await prisma.reminder.findMany({
      where: {
        orgId,
        appointmentId,
        type: "appointment_24h",
        status: "pending",
        sendAt: { lte: new Date() }
      }
    });

    for (const reminder of reminders) {
      const body = renderTemplate(settings?.templateReminder || "Hej {{clientName}}, przypomnienie o wizycie {{appointmentDate}}.", {
        clientName: appointment.client.name,
        appointmentDate: appointment.startsAt.toLocaleString("pl-PL")
      });

      if (appointment.client.phone) {
        await sendSms({ orgId, to: appointment.client.phone, body });
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "sent", sentAt: new Date() }
        });
      } else {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "skipped", sentAt: new Date() }
        });
      }
    }
  },
  { connection }
);

new Worker(
  "no-reply",
  async () => {
    const orgs = await prisma.organization.findMany();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const org of orgs) {
      const clients = await prisma.client.findMany({
        where: { orgId: org.id },
        include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } }
      });

      const owner = await prisma.membership.findFirst({
        where: { orgId: org.id, role: "owner" },
        include: { user: true }
      });
      const artist = await prisma.artist.findFirst({ where: { orgId: org.id } });

      for (const client of clients) {
        const lastInbound = client.messages.find((m) => m.direction === "inbound");
        const lastOutbound = client.messages.find((m) => m.direction === "outbound");
        if (!lastInbound) continue;
        if (lastInbound.createdAt > cutoff) continue;
        if (!lastOutbound || lastOutbound.createdAt < lastInbound.createdAt) {
          const text = `Brak odpowiedzi od 24h: ${client.name}. Sprawdź rozmowę.`;
          if (owner?.user.email) {
            await sendEmail({
              orgId: org.id,
              to: owner.user.email,
              subject: "TaFlo: brak odpowiedzi 24h",
              html: `<p>${text}</p>`
            });
          }
          if (artist?.phone) {
            await sendSms({ orgId: org.id, to: artist.phone, body: text });
          }
        }
      }
    }
  },
  { connection }
);

new Worker(
  "deposit",
  async () => {
    const now = new Date();
    const orgs = await prisma.organization.findMany();
    for (const org of orgs) {
      const appointments = await prisma.appointment.findMany({
        where: {
          orgId: org.id,
          depositStatus: "pending",
          depositDueAt: { gte: now }
        },
        include: { client: true }
      });

      for (const appointment of appointments) {
        const already = await prisma.reminder.findFirst({
          where: {
            orgId: org.id,
            appointmentId: appointment.id,
            type: "deposit",
            sendAt: { gte: new Date(Date.now() - 20 * 60 * 60 * 1000) }
          }
        });
        if (already) continue;

        const body = `Przypomnienie o zadatku. Link: ${appointment.depositLink}`;
        if (appointment.client.phone) {
          await sendSms({ orgId: org.id, to: appointment.client.phone, body });
        } else if (appointment.client.email) {
          await sendEmail({
            orgId: org.id,
            to: appointment.client.email,
            subject: "Przypomnienie o zadatku",
            html: `<p>${body}</p>`
          });
        }

        await prisma.reminder.create({
          data: {
            orgId: org.id,
            appointmentId: appointment.id,
            type: "deposit",
            channel: appointment.client.phone ? "sms" : "email",
            sendAt: new Date(),
            status: "sent",
            sentAt: new Date()
          }
        });
      }
    }
  },
  { connection }
);

new Worker(
  "marketing",
  async (job) => {
    const { campaignId, orgId } = job.data as { campaignId: string; orgId: string };
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) return;

    const clients = await prisma.client.findMany({
      where: {
        orgId,
        marketingOptIn: campaign.onlyOptIn ? true : undefined,
        unsubscribedAt: null
      }
    });

    for (const client of clients) {
      const token = client.unsubscribeToken || generateToken(16);
      if (!client.unsubscribeToken) {
        await prisma.client.update({ where: { id: client.id }, data: { unsubscribeToken: token } });
      }
      const unsubscribeUrl = `${env.PUBLIC_BASE_URL}/api/unsubscribe?token=${token}`;
      const body = `${campaign.body}\n\nWypisz się: ${unsubscribeUrl}`;

      if (campaign.channel === "email" && client.email) {
        await sendEmail({
          orgId,
          to: client.email,
          subject: campaign.subject || campaign.name,
          html: `<p>${body.replace(/\n/g, "<br/>")}</p>`
        });
      }
      if (campaign.channel === "sms" && client.phone) {
        await sendSms({ orgId, to: client.phone, body });
      }

      await prisma.campaignSend.create({
        data: {
          campaignId: campaign.id,
          clientId: client.id,
          status: "sent",
          sentAt: new Date()
        }
      });
    }

    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "sent" } });
  },
  { connection }
);

new Worker(
  "dunning",
  async () => {
    const orgs = await prisma.organization.findMany({
      where: { subscriptionStatus: "past_due" }
    });

    for (const org of orgs) {
      const owner = await prisma.membership.findFirst({
        where: { orgId: org.id, role: "owner" },
        include: { user: true }
      });
      if (owner?.user.email) {
        await sendEmail({
          orgId: org.id,
          to: owner.user.email,
          subject: "TaFlo: problem z płatnością",
          html: "<p>Twoja płatność nie przeszła. Zaktualizuj metodę płatności.</p>"
        });
      }
    }
  },
  { connection }
);
