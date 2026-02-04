import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db";
import { upsertLead } from "@/server/services/lead-service";
import { createAppointment } from "@/server/services/appointment-service";

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIf = hasDb ? describe : describe.skip;

describeIf("Lead → wizyta → przypomnienia", () => {
  it("tworzy lead i przypomnienia", async () => {
    const org = await prisma.organization.create({
      data: { name: "Test Org", timezone: "Europe/Warsaw", currency: "PLN" }
    });
    const artist = await prisma.artist.create({
      data: { orgId: org.id, name: "Test Artist" }
    });
    const client = await prisma.client.create({
      data: { orgId: org.id, name: "Test Client" }
    });

    const leadResult = await upsertLead({
      orgId: org.id,
      name: "Lead Test",
      source: "website"
    });

    const appointment = await createAppointment({
      orgId: org.id,
      clientId: client.id,
      artistId: artist.id,
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    });

    const reminders = await prisma.reminder.findMany({ where: { appointmentId: appointment.id } });

    expect(leadResult.lead.id).toBeTruthy();
    expect(reminders.length).toBeGreaterThanOrEqual(2);

    await prisma.organization.delete({ where: { id: org.id } });
  });
});
