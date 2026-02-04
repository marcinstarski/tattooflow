import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    throw new Error("Brak sesji");
  }
  return session;
}

export async function requireOrgId() {
  const session = await requireSession();
  return session.user.orgId as string;
}

export async function requireRole() {
  const session = await requireSession();
  return session.user.role || "artist";
}

export async function requireUserId() {
  const session = await requireSession();
  return session.user.id as string | undefined;
}

export async function getArtistId() {
  const session = await requireSession();
  const userId = session.user.id as string | undefined;
  const orgId = session.user.orgId as string | undefined;
  if (!userId || !orgId) return null;

  const artist = await prisma.artist.findFirst({
    where: { userId, orgId }
  });
  if (artist) return artist.id;

  const email = session.user.email;
  if (email) {
    const byEmail = await prisma.artist.findFirst({
      where: { orgId, email, userId: null }
    });
    if (byEmail) {
      const updated = await prisma.artist.update({
        where: { id: byEmail.id },
        data: { userId }
      });
      return updated.id;
    }
  }

  return null;
}

export async function requireArtistId() {
  const artistId = await getArtistId();
  if (!artistId) {
    throw new Error("Brak profilu artysty");
  }
  return artistId;
}
