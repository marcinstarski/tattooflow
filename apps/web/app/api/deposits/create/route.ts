import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { createDepositCheckout } from "@/server/billing/stripe";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const appointmentId = body.appointmentId as string;
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, orgId },
    include: { client: true }
  });
  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const amount = appointment.depositAmount || 0;
  if (!amount) {
    return NextResponse.json({ error: "Brak kwoty zadatku" }, { status: 400 });
  }

  const checkout = await createDepositCheckout({
    orgId,
    appointmentId,
    amount,
    clientEmail: appointment.client.email || undefined
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      depositStatus: "pending",
      depositLink: checkout.url
    }
  });

  return NextResponse.json({ url: checkout.url });
}
