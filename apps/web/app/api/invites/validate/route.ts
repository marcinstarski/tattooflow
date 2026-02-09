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

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { org: true }
  });
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }
  if (invite.acceptedAt) {
    return NextResponse.json({ error: "Invite already used" }, { status: 410 });
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  return NextResponse.json({
    email: invite.email,
    name: invite.name,
    orgName: invite.org.name
  });
}
