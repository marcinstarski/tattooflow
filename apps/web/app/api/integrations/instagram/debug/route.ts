import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getArtistId } from "@/server/tenant";
import { env } from "@/server/env";

const graphVersion = env.META_GRAPH_VERSION || "v19.0";
const graphBase = `https://graph.facebook.com/${graphVersion}`;

export async function GET() {
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }
  const integration = await prisma.artistIntegration.findUnique({ where: { artistId } });
  if (!integration?.userAccessToken) {
    return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });
  }
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    return NextResponse.json({ error: "Brak META_APP_ID/META_APP_SECRET" }, { status: 400 });
  }

  const appAccessToken = `${env.META_APP_ID}|${env.META_APP_SECRET}`;

  const debugUrl = new URL(`${graphBase}/debug_token`);
  debugUrl.searchParams.set("input_token", integration.userAccessToken);
  debugUrl.searchParams.set("access_token", appAccessToken);

  const accountsUrl = new URL(`${graphBase}/me/accounts`);
  accountsUrl.searchParams.set("fields", "id,name,instagram_business_account");
  accountsUrl.searchParams.set("access_token", integration.userAccessToken);

  const meUrl = new URL(`${graphBase}/me`);
  meUrl.searchParams.set("fields", "id,name");
  meUrl.searchParams.set("access_token", integration.userAccessToken);

  const permissionsUrl = new URL(`${graphBase}/me/permissions`);
  permissionsUrl.searchParams.set("access_token", integration.userAccessToken);

  const [debugRes, meRes, accountsRes, permissionsRes] = await Promise.all([
    fetch(debugUrl.toString()),
    fetch(meUrl.toString()),
    fetch(accountsUrl.toString()),
    fetch(permissionsUrl.toString())
  ]);

  const [debugData, meData, accountsData, permissionsData] = await Promise.all([
    debugRes.json().catch(() => ({})),
    meRes.json().catch(() => ({})),
    accountsRes.json().catch(() => ({})),
    permissionsRes.json().catch(() => ({}))
  ]);

  return NextResponse.json({
    debug: debugData,
    me: meData,
    accounts: accountsData,
    permissions: permissionsData
  });
}
