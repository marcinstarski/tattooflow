import { env } from "@/server/env";

export async function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!env.POSTHOG_KEY) {
    return;
  }

  try {
    await fetch("https://app.posthog.com/capture/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: env.POSTHOG_KEY,
        event,
        properties: {
          ...properties
        }
      })
    });
  } catch (error) {
    console.warn("PostHog error", error);
  }
}
