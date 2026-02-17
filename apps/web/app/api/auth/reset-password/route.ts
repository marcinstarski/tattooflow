import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token || !password) {
    return NextResponse.json({ error: "Brak danych." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  const reset = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  if (!reset) {
    return NextResponse.json({ error: "Link resetu wygasł lub jest nieprawidłowy." }, { status: 400 });
  }

  const passwordHash = await hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: reset.userId, id: { not: reset.id } }
    })
  ]);

  return NextResponse.json({ ok: true });
}
