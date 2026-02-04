import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId } from "@/server/tenant";
import { campaignCreateSchema } from "@inkflow/shared";
import { marketingQueue } from "@/server/jobs/queues";
import { planFeatures } from "@/server/billing/plans";

export async function GET() {
  const orgId = await requireOrgId();
  const campaigns = await prisma.campaign.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const parsed = campaignCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const features = planFeatures[org?.plan || "starter"];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const sentCount = await prisma.campaign.count({
    where: {
      orgId,
      createdAt: { gte: monthStart }
    }
  });
  if (sentCount >= features.campaignsPerMonth) {
    return NextResponse.json({ error: "Limit kampanii w planie" }, { status: 402 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      orgId,
      name: parsed.data.name,
      channel: parsed.data.channel,
      subject: parsed.data.subject,
      body: parsed.data.body,
      onlyOptIn: parsed.data.onlyOptIn,
      status: parsed.data.sendAt ? "scheduled" : "draft",
      sendAt: parsed.data.sendAt ? new Date(parsed.data.sendAt) : undefined
    }
  });

  if (parsed.data.sendAt) {
    await marketingQueue.add(
      "send_campaign",
      { campaignId: campaign.id, orgId },
      { delay: Math.max(0, new Date(parsed.data.sendAt).getTime() - Date.now()) }
    );
  }

  return NextResponse.json(campaign);
}
