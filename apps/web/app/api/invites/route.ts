import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole } from "@/server/tenant";
import { generateToken } from "@/server/utils/token";
import { sendEmail } from "@/server/notifications";
import { env } from "@/server/env";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["artist", "reception", "owner"]).optional()
});

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.invite.create({
    data: {
      orgId,
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role || "artist",
      token,
      expiresAt
    }
  });

  const baseUrl = env.PUBLIC_BASE_URL || env.NEXTAUTH_URL || "";
  const link = `${baseUrl}/auth/set-password?token=${token}`;
  await sendEmail({
    orgId,
    to: invite.email,
    subject: "TaFlo: ustaw hasło do konta",
    html: `<p>Cześć!</p><p>Ustaw hasło do konta TaFlo:</p><p><a href="${link}">${link}</a></p>`
  });

  return NextResponse.json({ ok: true });
}
