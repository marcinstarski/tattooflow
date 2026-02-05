import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import {
  exchangeInstagramCode,
  fetchInstagramPageDetails,
  fetchInstagramPages,
  subscribeInstagramPage,
  verifyInstagramState
} from "@/server/integrations/instagram";

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
    const integration = await prisma.artistIntegration.upsert({
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

    try {
      const pages = await fetchInstagramPages(token.accessToken);
      const firstPage = pages[0];
      if (firstPage?.id) {
        const page = await fetchInstagramPageDetails(firstPage.id, token.accessToken);
        const pageAccessToken = page.access_token;
        if (pageAccessToken) {
          await subscribeInstagramPage(page.id, pageAccessToken);
          await prisma.artistIntegration.update({
            where: { artistId: integration.artistId },
            data: {
              status: "connected",
              pageId: page.id,
              pageName: page.name,
              pageAccessToken,
              igBusinessAccountId: page.instagram_business_account?.id || null,
              connectedAt: new Date()
            }
          });
          return NextResponse.redirect(new URL("/app/settings?ig=connected", req.url));
        }
      }
    } catch (error) {
      console.error("[IG CALLBACK AUTO-CONNECT]", error);
    }
    return NextResponse.redirect(new URL("/app/settings?ig=authorized", req.url));
  } catch (error) {
    console.error("[IG CALLBACK]", error);
    return NextResponse.redirect(new URL("/app/settings?ig=error", req.url));
  }
}
