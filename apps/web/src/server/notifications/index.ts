import { Resend } from "resend";
import Twilio from "twilio";
import { env, isDevMode } from "@/server/env";
import { prisma } from "@/server/db";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const twilio = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;
const smsApiToken = env.SMSAPI_TOKEN;
const smsApiFrom = env.SMSAPI_FROM;

async function sendSmsViaSmsApi(params: { to: string; body: string }) {
  if (!smsApiToken || !smsApiFrom) {
    throw new Error("SMSAPI not configured");
  }
  const form = new URLSearchParams();
  form.set("to", params.to);
  form.set("message", params.body);
  form.set("from", smsApiFrom);
  form.set("format", "json");

  const res = await fetch("https://api.smsapi.pl/sms.do", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${smsApiToken}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  if (!res.ok) {
    const data = await res.text().catch(() => "");
    throw new Error(`SMSAPI error: ${res.status} ${data}`);
  }
}

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
  if (isDevMode || (!twilio && !(smsApiToken && smsApiFrom))) {
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
  if (smsApiToken && smsApiFrom) {
    await sendSmsViaSmsApi({ to: params.to, body: params.body });
    return;
  }
  await twilio!.messages.create({
    from: env.TWILIO_FROM,
    to: params.to,
    body: params.body
  });
}
