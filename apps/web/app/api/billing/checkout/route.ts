import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { createSubscriptionCheckout } from "@/server/billing/stripe";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const plan = (body.plan as "starter" | "pro" | "studio") || "starter";
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const owner = await prisma.membership.findFirst({
    where: { orgId, role: "owner" },
    include: { user: true }
  });
  const email = owner?.user.email || "owner@example.com";

  await prisma.organization.update({
    where: { id: orgId },
    data: { plan }
  });

  const checkout = await createSubscriptionCheckout(orgId, plan, email);
  return NextResponse.json(checkout);
}
