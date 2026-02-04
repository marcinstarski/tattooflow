import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId } from "@/server/tenant";

export async function GET() {
  const orgId = await requireOrgId();
  const clients = await prisma.client.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      orgId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      igHandle: body.igHandle,
      marketingOptIn: body.marketingOptIn ?? false,
      notes: body.notes
    }
  });
  return NextResponse.json(client);
}
