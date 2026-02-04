import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { exchangeInstagramCode, verifyInstagramState } from "@/server/integrations/instagram";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const payload = verifyInstagramState(state);

  if (!code || !payload) {
    return NextResponse.redirect(new URL("/app/settings?ig=error", req.url));
  }

  try {
    const token = await exchangeInstagramCode(code);
    await prisma.artistIntegration.upsert({
      where: { artistId: payload.artistId },
      update: {
        orgId: payload.orgId,
        status: "authorized",
        userAccessToken: token.accessToken,
        userTokenExpiresAt: token.expiresAt,
        connectedAt: null
      },
      create: {
        orgId: payload.orgId,
        artistId: payload.artistId,
        status: "authorized",
        userAccessToken: token.accessToken,
        userTokenExpiresAt: token.expiresAt
      }
    });
    return NextResponse.redirect(new URL("/app/settings?ig=authorized", req.url));
  } catch (error) {
    console.error("[IG CALLBACK]", error);
    return NextResponse.redirect(new URL("/app/settings?ig=error", req.url));
  }
}
