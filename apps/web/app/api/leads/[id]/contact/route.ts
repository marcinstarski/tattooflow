import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOrgId, requireUserId } from "@/server/tenant";
import { sendEmail, sendSms } from "@/server/notifications";
import { logAudit } from "@/server/utils/audit";

const schema = z.object({
  channel: z.enum(["email", "sms"]),
  subject: z.string().optional(),
  body: z.string().min(1)
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orgId = await requireOrgId();
  const userId = await requireUserId();
  const payload = await req.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({ where: { id: params.id, orgId } });
  if (!lead) {
    return NextResponse.json({ error: "Brak leada" }, { status: 404 });
  }

  if (parsed.data.channel === "email") {
    if (!lead.email) {
      return NextResponse.json({ error: "Lead nie ma emaila" }, { status: 400 });
    }
    const subject = parsed.data.subject || `TaFlo: kontakt w sprawie tatuażu`;
    await sendEmail({
      orgId,
      to: lead.email,
      subject,
      html: `<p>${parsed.data.body}</p>`
    });
  }

  if (parsed.data.channel === "sms") {
    if (!lead.phone) {
      return NextResponse.json({ error: "Lead nie ma telefonu" }, { status: 400 });
    }
    await sendSms({ orgId, to: lead.phone, body: parsed.data.body });
  }

  await logAudit({
    orgId,
    actorId: userId,
    action: "lead_contact",
    entity: "Lead",
    entityId: lead.id,
    metadata: { channel: parsed.data.channel }
  });

  return NextResponse.json({ ok: true });
}
