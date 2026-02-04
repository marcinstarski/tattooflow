import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/server/billing/stripe";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  try {
    const result = await handleStripeWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
