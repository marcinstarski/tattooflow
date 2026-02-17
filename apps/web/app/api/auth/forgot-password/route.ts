import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { generateToken } from "@/server/utils/token";
import { sendEmail } from "@/server/notifications";
import { env } from "@/server/env";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Brak emaila." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }
  const membership = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (!membership) {
    return NextResponse.json({ ok: true });
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  const baseUrl = env.PUBLIC_BASE_URL || env.NEXTAUTH_URL || "";
  const link = `${baseUrl}/auth/reset-password?token=${token}`;
  await sendEmail({
    orgId: membership.orgId,
    to: email,
    subject: "TaFlo: reset hasła",
    html: `
      <div style="background:#0b0b12;padding:32px;font-family:Arial,sans-serif;color:#f3f4f6">
        <div style="max-width:520px;margin:0 auto;background:#111827;border-radius:16px;padding:24px;border:1px solid #1f2937">
          <div style="font-size:20px;font-weight:700;letter-spacing:0.2px;margin-bottom:12px">TaFlo CRM</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:16px">
            Kliknij przycisk, aby ustawić nowe hasło.
          </div>
          <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#f9fafb;text-decoration:none;font-size:14px">
            Ustaw nowe hasło
          </a>
          <div style="font-size:12px;color:#9ca3af;margin-top:16px">
            Jeśli przycisk nie działa, skopiuj link: ${link}
          </div>
        </div>
      </div>
    `
  });

  return NextResponse.json({ ok: true });
}
