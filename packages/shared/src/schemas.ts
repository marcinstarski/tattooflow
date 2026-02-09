import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

export const leadCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().min(6).optional()),
  igHandle: z.preprocess(emptyToUndefined, z.string().min(2).optional()),
  source: z.enum(["facebook", "instagram", "website", "other"]).default("website"),
  message: z.preprocess(emptyToUndefined, z.string().optional()),
  marketingOptIn: z.boolean().default(false),
  honeypot: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const appointmentCreateSchema = z.object({
  clientId: z.string().min(1),
  artistId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  price: z.number().nonnegative().optional(),
  description: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().nonnegative().optional(),
  depositDueAt: z.string().datetime().optional(),
  depositPaid: z.boolean().optional(),
});

export const messageCreateSchema = z.object({
  clientId: z.string().min(1),
  direction: z.enum(["inbound", "outbound"]),
  channel: z.enum(["email", "sms", "instagram", "facebook", "other"]).default("other"),
  body: z.string().min(1),
});

export const campaignCreateSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(["email", "sms"]),
  subject: z.string().optional(),
  body: z.string().min(1),
  sendAt: z.string().datetime().optional(),
  onlyOptIn: z.boolean().default(true),
});

export const onboardingSchema = z.object({
  studioName: z.string().min(1),
  timezone: z.string().min(1).default("Europe/Warsaw"),
  artistName: z.string().min(1),
});

export const billingDetailsSchema = z.object({
  companyName: z.string().min(1),
  taxId: z.string().min(1).optional(),
  address: z.string().min(1),
});
