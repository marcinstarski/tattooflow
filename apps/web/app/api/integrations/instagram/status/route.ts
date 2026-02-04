import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireOrgId, getArtistId } from "@/server/tenant";
import { env } from "@/server/env";
import { getInstagramWebhookUrl, getInstagramRedirectUri } from "@/server/integrations/instagram";

export async function GET() {
  const orgId = await requireOrgId();
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });

  const configured = Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_WEBHOOK_VERIFY_TOKEN);
  const payload = {
    configured,
    webhookUrl: getInstagramWebhookUrl(),
    redirectUri: getInstagramRedirectUri(),
    status: integration?.status || "disconnected",
    pageName: integration?.pageName || null,
    pageId: integration?.pageId || null,
    igBusinessAccountId: integration?.igBusinessAccountId || null,
    connectedAt: integration?.connectedAt?.toISOString() || null,
    hasToken: Boolean(integration?.userAccessToken)
  };

  return NextResponse.json(payload);
}
