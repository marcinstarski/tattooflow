import { NextResponse } from "next/server";
import { requireOrgId } from "@/server/tenant";
import { prisma } from "@/server/db";
import { billingDetailsSchema } from "@inkflow/shared";

export async function GET() {
  const orgId = await requireOrgId();
  const profile = await prisma.billingProfile.findUnique({ where: { orgId } });
  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const parsed = billingDetailsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const profile = await prisma.billingProfile.upsert({
    where: { orgId },
    create: { orgId, ...parsed.data },
    update: parsed.data
  });
  return NextResponse.json(profile);
}
