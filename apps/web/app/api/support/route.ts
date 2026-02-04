import { NextResponse } from "next/server";
import { sendEmail } from "@/server/notifications";
import { requireOrgId } from "@/server/tenant";

export async function POST(req: Request) {
  const orgId = await requireOrgId();
  const body = await req.json();
  await sendEmail({
    orgId,
    to: "support@inkflow.pl",
    subject: body.subject || "Support",
    html: `<p>${body.message || "Brak treści"}</p>`
  });
  return NextResponse.json({ ok: true });
}
