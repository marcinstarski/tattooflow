import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId } from "@/server/tenant";

const settingsSchema = z.object({
  depositType: z.enum(["fixed", "percent"]).optional(),
  depositValue: z.number().int().min(0).optional(),
  depositDueDays: z.number().int().min(0).optional(),
  templateReminder: z.string().min(1).optional(),
  templateDeposit: z.string().min(1).optional(),
  templateFollowUp: z.string().min(1).optional()
});

export async function GET() {
  const orgId = await requireOrgId();
  const settings = await prisma.settings.upsert({
    where: { orgId },
    update: {},
    create: { orgId }
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { orgId },
    update: parsed.data,
    create: { orgId, ...parsed.data }
  });

  return NextResponse.json(settings);
}
