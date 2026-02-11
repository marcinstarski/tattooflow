import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { z } from "zod";
import { encode } from "next-auth/jwt";
import { env } from "@/server/env";

const schema = z.object({
  token: z.string().min(10)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const parsed = schema.safeParse({ token });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/auth/login", url));
  }

  const record = await prisma.onboardingToken.findUnique({
    where: { token },
    include: {
      user: { include: { memberships: true } },
      org: true
    }
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return NextResponse.redirect(new URL("/auth/login", url));
  }

  const membership = record.user.memberships.find((m) => m.orgId === record.orgId);
  const jwt = await encode({
    token: {
      sub: record.userId,
      email: record.user.email,
      orgId: record.orgId,
      role: membership?.role || "owner"
    },
    secret: env.NEXTAUTH_SECRET
  });

  await prisma.onboardingToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() }
  });

  const response = NextResponse.redirect(new URL("/app", url));
  const isSecure = url.protocol === "https:";
  response.cookies.set(isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token", jwt, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
