import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, requireRole, getArtistId } from "@/server/tenant";
import { getArtistLimit } from "@/server/billing/limits";

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
  return NextResponse.json(artist);
}
