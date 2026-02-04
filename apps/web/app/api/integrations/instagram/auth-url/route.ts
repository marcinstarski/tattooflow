import { NextResponse } from "next/server";
import { requireOrgId, getArtistId } from "@/server/tenant";
import { buildInstagramAuthUrl } from "@/server/integrations/instagram";

export async function POST() {
  const orgId = await requireOrgId();
  const artistId = await getArtistId();
  if (!artistId) {
    return NextResponse.json({ error: "Brak profilu artysty" }, { status: 400 });
  }

  try {
    const url = buildInstagramAuthUrl(orgId, artistId);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
