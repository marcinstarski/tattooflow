import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(10)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const parsed = schema.safeParse({ token });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const record = await prisma.onboardingToken.findUnique({
    where: { token },
    include: { org: true, user: true }
  });
  if (!record) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }
  if (record.usedAt) {
    return NextResponse.json({ error: "Token used" }, { status: 410 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  return NextResponse.json({
    orgName: record.org.name,
    timezone: record.org.timezone,
    email: record.user.email
  });
}
