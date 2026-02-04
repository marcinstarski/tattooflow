import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, getArtistId } from "@/server/tenant";
import { fetchInstagramPageDetails, subscribeInstagramPage } from "@/server/integrations/instagram";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });
  if (!integration?.userAccessToken) {
    return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });
  }

  const body = await req.json();
  const pageId = body?.pageId as string | undefined;
  if (!pageId) {
    return NextResponse.json({ error: "Brak pageId" }, { status: 400 });
  }

  try {
    const page = await fetchInstagramPageDetails(pageId, integration.userAccessToken);
    const pageAccessToken = page.access_token;
    const igBusinessAccountId = page.instagram_business_account?.id || null;

    if (!pageAccessToken) {
      return NextResponse.json({ error: "Brak tokenu strony" }, { status: 400 });
    }

    await subscribeInstagramPage(pageId, pageAccessToken);

    const updated = await prisma.artistIntegration.upsert({
      where: { artistId },
      update: {
        status: "connected",
        orgId,
        artistId,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken,
        igBusinessAccountId,
        connectedAt: new Date()
      },
      create: {
        orgId,
        artistId,
        status: "connected",
        pageId: page.id,
        pageName: page.name,
        pageAccessToken,
        igBusinessAccountId,
        connectedAt: new Date()
      }
    });

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
