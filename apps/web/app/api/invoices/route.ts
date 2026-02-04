import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";

export async function GET() {
  const orgId = await requireOrgId();
  const invoices = await prisma.invoice.findMany({
    where: { orgId },
    orderBy: { issuedAt: "desc" }
  });
  return NextResponse.json(invoices);
}
