import { Resend } from "resend";
import Twilio from "twilio";
import { env, isDevMode } from "@/server/env";
import { prisma } from "@/server/db";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const twilio = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendEmail(params: {
  orgId: string;
  to: string;
  subject: string;
  html: string;
}) {
  if (isDevMode || !resend || !env.EMAIL_FROM) {
    await prisma.outbox.create({
      data: {
        orgId: params.orgId,
        channel: "email",
        to: params.to,
        subject: params.subject,
        body: params.html
      }
    });
    console.log("[DEV EMAIL]", params.subject, params.to);
    return;
  }
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html
  });
}

export async function sendSms(params: { orgId: string; to: string; body: string }) {
  if (isDevMode || !twilio || !env.TWILIO_FROM) {
    await prisma.outbox.create({
      data: {
        orgId: params.orgId,
        channel: "sms",
        to: params.to,
        body: params.body
      }
    });
    console.log("[DEV SMS]", params.to, params.body);
    return;
  }
  await twilio.messages.create({
    from: env.TWILIO_FROM,
    to: params.to,
    body: params.body
  });
}
