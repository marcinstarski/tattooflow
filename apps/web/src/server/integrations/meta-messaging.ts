import { env } from "@/server/env";

export async function sendMetaMessage(params: {
  channel: "instagram" | "facebook";
  recipientId: string;
  text: string;
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

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_type: "RESPONSE",
      recipient: { id: params.recipientId },
      message: { text: params.text }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message;
    throw new Error(message || "Meta API error");
  }

  return data as { message_id?: string; id?: string };
}
