import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db";
import { createSubscriptionCheckout } from "@/server/billing/stripe";

const hasDb = Boolean(process.env.DATABASE_URL);
const describeIf = hasDb ? describe : describe.skip;

describeIf("Trial → upgrade", () => {
  it("tworzy checkout lub fallback", async () => {
    const org = await prisma.organization.create({
      data: { name: "Billing Org", timezone: "Europe/Warsaw", currency: "PLN" }
    });

    const checkout = await createSubscriptionCheckout(org.id, "starter", "owner@example.com");
    expect(checkout.url).toBeTruthy();

    await prisma.organization.delete({ where: { id: org.id } });
  });
});
