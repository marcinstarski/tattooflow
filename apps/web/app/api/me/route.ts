import { NextResponse } from "next/server";
import { requireSession } from "@/server/tenant";
import { prisma } from "@/server/db";

export async function GET() {
  const session = await requireSession();
  const orgId = session.user.orgId as string;
  const userId = session.user.id as string | undefined;
  const role = session.user.role || "artist";

  let artistId: string | null = null;
  if (userId) {
    const artist = await prisma.artist.findFirst({ where: { orgId, userId } });
    artistId = artist?.id || null;
  }

  return NextResponse.json({
    orgId,
    userId,
    role,
    artistId
  });
}
