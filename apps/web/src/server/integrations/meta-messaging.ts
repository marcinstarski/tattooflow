import { env } from "@/server/env";

export async function fetchMetaProfile(params: {
  channel: "instagram" | "facebook";
  senderId: string;
  pageAccessToken: string;
}) {
  const graphVersion = env.META_GRAPH_VERSION || "v19.0";
  const base = `https://graph.facebook.com/${graphVersion}`;
  const fields = params.channel === "instagram" ? "username,name" : "name,first_name,last_name";
  const url = new URL(`${base}/${params.senderId}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", params.pageAccessToken);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return null;
  }

  const name =
    typeof data.name === "string"
      ? data.name
      : typeof data.first_name === "string" || typeof data.last_name === "string"
      ? `${data.first_name || ""} ${data.last_name || ""}`.trim()
      : typeof data.username === "string"
      ? `@${data.username}`
      : null;

  return name || null;
}

export async function sendMetaMessage(params: {
  channel: "instagram" | "facebook";
  recipientId: string;
  text?: string;
  imageUrl?: string;
  pageAccessToken: string;
  igBusinessAccountId?: string | null;
}) {
  const graphVersion = env.META_GRAPH_VERSION || "v19.0";
  const base = `https://graph.facebook.com/${graphVersion}`;

  const path =
    params.channel === "instagram"
      ? `${params.igBusinessAccountId}/messages`
      : "me/messages";

  const url = new URL(`${base}/${path}`);
  url.searchParams.set("access_token", params.pageAccessToken);

  const message =
    params.imageUrl
      ? {
          attachment: {
            type: "image",
            payload: {
              url: params.imageUrl,
              is_reusable: true
            }
          }
        }
      : { text: params.text || "" };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_type: "RESPONSE",
      recipient: { id: params.recipientId },
      message
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message;
    throw new Error(message || "Meta API error");
  }

  return data as { message_id?: string; id?: string };
}
