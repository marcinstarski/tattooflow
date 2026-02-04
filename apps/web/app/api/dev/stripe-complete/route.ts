import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId } from "@/server/tenant";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  if (body.type === "subscription") {
    await prisma.organization.update({
      where: { id: orgId },
      data: { subscriptionStatus: "active", plan: body.plan || "starter" }
    });
  }
  if (body.type === "deposit" && body.appointmentId) {
    await prisma.appointment.update({
      where: { id: body.appointmentId },
      data: { depositStatus: "paid", depositPaidAt: new Date() }
    });
  }
  return NextResponse.json({ ok: true });
}
