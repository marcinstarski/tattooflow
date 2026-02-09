import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";
import { getArtistLimit } from "@/server/billing/limits";
import { generateToken } from "@/server/utils/token";
import { sendEmail } from "@/server/notifications";
import { env } from "@/server/env";

export async function GET() {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role === "artist") {
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json([]);
    }
    const artist = await prisma.artist.findFirst({
      where: { id: artistId, orgId }
    });
    return NextResponse.json(artist ? [artist] : []);
  }
  const artists = await prisma.artist.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(artists);
}

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const role = await requireRole();
  if (role !== "owner") {
    return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
  }
  const limit = await getArtistLimit(orgId);
  if (!limit) {
    return NextResponse.json({ error: "Brak organizacji" }, { status: 404 });
  }
  const currentCount = await prisma.artist.count({ where: { orgId } });
  if (currentCount >= limit.total) {
    return NextResponse.json(
      { error: "Limit artystów w planie. Dokup dodatkowe stanowisko." },
      { status: 402 }
    );
  }
  const body = await req.json();
  const artist = await prisma.artist.create({
    data: {
      orgId,
      name: body.name,
      email: body.email,
      phone: body.phone
    }
  });

  if (body.email) {
    await prisma.invite.deleteMany({ where: { orgId, email: body.email } });
    const token = generateToken(24);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.invite.create({
      data: {
        orgId,
        email: body.email,
        name: body.name,
        role: "artist",
        token,
        expiresAt
      }
    });
    const baseUrl = env.PUBLIC_BASE_URL || env.NEXTAUTH_URL || "";
    const link = `${baseUrl}/auth/set-password?token=${token}`;
    await sendEmail({
      orgId,
      to: body.email,
      subject: "TaFlo: ustaw hasło do konta",
      html: `<p>Cześć!</p><p>Ustaw hasło do konta TaFlo:</p><p><a href="${link}">${link}</a></p>`
    });
  }

  return NextResponse.json(artist);
}
