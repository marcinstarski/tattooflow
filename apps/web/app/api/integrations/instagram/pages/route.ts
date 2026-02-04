import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getArtistId } from "@/server/tenant";
import { fetchInstagramPages } from "@/server/integrations/instagram";

export async function GET() {
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });
  if (!integration?.userAccessToken) {
    return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });
  }

  try {
    const pages = await fetchInstagramPages(integration.userAccessToken);
    const result = pages.map((page) => ({
      id: page.id,
      name: page.name,
      instagramBusinessAccountId: page.instagram_business_account?.id || null
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
