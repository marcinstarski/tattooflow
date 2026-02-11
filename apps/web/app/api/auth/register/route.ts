import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";
import { generateToken } from "@/server/utils/token";
import { sendEmail } from "@/server/notifications";
import { env } from "@/server/env";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, studioName } = body as { email?: string; password?: string; studioName?: string };

  if (!email || !password || !studioName) {
    return NextResponse.json({ error: "Brak danych" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Użytkownik już istnieje" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const org = await prisma.organization.create({
    data: {
      name: studioName,
      timezone: "Europe/Warsaw",
      currency: "PLN",
      plan: "starter",
      trialEndsAt
    }
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      memberships: {
        create: {
          orgId: org.id,
          role: "owner"
        }
      }
    }
  });

  await prisma.onboardingToken.deleteMany({ where: { userId: user.id } });
  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await prisma.onboardingToken.create({
    data: {
      userId: user.id,
      orgId: org.id,
      token,
      expiresAt
    }
  });

  const baseUrl = env.PUBLIC_BASE_URL || env.NEXTAUTH_URL || "";
  const link = `${baseUrl}/onboarding?token=${token}`;
  await sendEmail({
    orgId: org.id,
    to: email,
    subject: "TaFlo: dokończ rejestrację",
    html: `
      <div style="background:#0b0b12;padding:32px;font-family:Arial,sans-serif;color:#f3f4f6">
        <div style="max-width:520px;margin:0 auto;background:#111827;border-radius:16px;padding:24px;border:1px solid #1f2937">
          <div style="font-size:20px;font-weight:700;letter-spacing:0.2px;margin-bottom:12px">TaFlo CRM</div>
          <div style="font-size:14px;color:#d1d5db;margin-bottom:16px">
            Kliknij przycisk, aby dokończyć onboarding.
          </div>
          <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#f9fafb;text-decoration:none;font-size:14px">
            Przejdź do TaFlo
          </a>
          <div style="font-size:12px;color:#9ca3af;margin-top:16px">
            Jeśli przycisk nie działa, skopiuj link: ${link}
          </div>
        </div>
      </div>
    `
  });

  return NextResponse.json({ ok: true, userId: user.id, orgId: org.id });
}
