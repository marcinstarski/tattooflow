import crypto from "crypto";
import { env } from "@/server/env";

const graphVersion = env.META_GRAPH_VERSION || "v19.0";
const graphBase = `https://graph.facebook.com/${graphVersion}`;

const defaultScopes = [
  "instagram_basic",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_messaging"
];

type StatePayload = {
  orgId: string;
  artistId: string;
  ts: number;
};

export function getInstagramRedirectUri() {
  return `${env.PUBLIC_BASE_URL}/api/integrations/instagram/callback`;
}

export function buildInstagramAuthUrl(orgId: string, artistId: string) {
  if (!env.META_APP_ID) {
    throw new Error("META_APP_ID is missing");
  }
  const state = createState(orgId, artistId);
  const redirectUri = getInstagramRedirectUri();
  const url = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
  url.searchParams.set("client_id", env.META_APP_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", defaultScopes.join(","));
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export function verifyInstagramState(state: string | null) {
  if (!state) return null;
  const [encoded, signature] = state.split(".");
  if (!encoded || !signature) return null;
  const expected = createSignature(encoded);
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as StatePayload;
    if (!payload.orgId || !payload.artistId) return null;
    if (Date.now() - payload.ts > 15 * 60 * 1000) return null;
    return { orgId: payload.orgId, artistId: payload.artistId };
  } catch {
    return null;
  }
}

function createState(orgId: string, artistId: string) {
  const payload: StatePayload = { orgId, artistId, ts: Date.now() };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(encoded);
  return `${encoded}.${signature}`;
}

function createSignature(encoded: string) {
  return crypto.createHmac("sha256", env.NEXTAUTH_SECRET).update(encoded).digest("base64url");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function exchangeInstagramCode(code: string) {
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    throw new Error("Brak konfiguracji META_APP_ID/META_APP_SECRET");
  }
  const redirectUri = getInstagramRedirectUri();
  const shortUrl = new URL(`${graphBase}/oauth/access_token`);
  shortUrl.searchParams.set("client_id", env.META_APP_ID);
  shortUrl.searchParams.set("client_secret", env.META_APP_SECRET);
  shortUrl.searchParams.set("redirect_uri", redirectUri);
  shortUrl.searchParams.set("code", code);

  const shortRes = await fetch(shortUrl.toString());
  const shortData = await shortRes.json();
  if (!shortRes.ok || !shortData.access_token) {
    throw new Error(shortData?.error?.message || "Nie udało się pobrać tokenu");
  }

  let accessToken = shortData.access_token as string;
  let expiresIn = typeof shortData.expires_in === "number" ? shortData.expires_in : undefined;

  const longUrl = new URL(`${graphBase}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", env.META_APP_ID);
  longUrl.searchParams.set("client_secret", env.META_APP_SECRET);
  longUrl.searchParams.set("fb_exchange_token", accessToken);

  const longRes = await fetch(longUrl.toString());
  const longData = await longRes.json();
  if (longRes.ok && longData.access_token) {
    accessToken = longData.access_token as string;
    if (typeof longData.expires_in === "number") {
      expiresIn = longData.expires_in as number;
    }
  }

  return {
    accessToken,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null
  };
}

export async function fetchInstagramPages(userAccessToken: string) {
  const url = new URL(`${graphBase}/me/accounts`);
  url.searchParams.set("fields", "id,name,instagram_business_account");
  url.searchParams.set("access_token", userAccessToken);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Nie udało się pobrać listy stron");
  }

  return (data?.data || []) as Array<{
    id: string;
    name: string;
    instagram_business_account?: { id: string } | null;
  }>;
}

export async function fetchInstagramPageDetails(pageId: string, userAccessToken: string) {
  const url = new URL(`${graphBase}/${pageId}`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
  url.searchParams.set("access_token", userAccessToken);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Nie udało się pobrać danych strony");
  }

  return data as {
    id: string;
    name: string;
    access_token?: string;
    instagram_business_account?: { id: string } | null;
  };
}

export async function subscribeInstagramPage(pageId: string, pageAccessToken: string) {
  const url = new URL(`${graphBase}/${pageId}/subscribed_apps`);
  url.searchParams.set("access_token", pageAccessToken);
  url.searchParams.set("subscribed_fields", "messages,messaging_postbacks");

  const res = await fetch(url.toString(), { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: { message?: string } })?.error?.message || "Nie udało się zasubskrybować webhooka");
  }

  return data;
}

export function verifyInstagramSignature(rawBody: string, signatureHeader: string | null) {
  if (!env.META_APP_SECRET) {
    return true;
  }
  if (!signatureHeader) {
    return false;
  }
  const expected = `sha256=${crypto.createHmac("sha256", env.META_APP_SECRET).update(rawBody).digest("hex")}`;
  if (expected.length !== signatureHeader.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

export function getInstagramWebhookUrl() {
  return `${env.PUBLIC_BASE_URL}/api/integrations/instagram/webhook`;
}
