import { z } from "zod";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function findEnvPath() {
  const candidates: string[] = [];

  let current = process.cwd();
  for (let i = 0; i < 4; i += 1) {
    candidates.push(path.join(current, ".env"));
    candidates.push(path.join(current, "apps/web/.env"));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  const serverDir = __dirname;
  candidates.push(path.resolve(serverDir, "../../.env"));
  candidates.push(path.resolve(serverDir, "../../../.env"));

  return candidates.find((candidate) => fs.existsSync(candidate));
}

const envPath = findEnvPath();
if (envPath) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  PUBLIC_BASE_URL: z.string().min(1).default("http://localhost:3000"),
  REDIS_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_STUDIO: z.string().optional(),
  STRIPE_PRICE_SEAT: z.string().optional(),
  STRIPE_PORTAL_RETURN_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM: z.string().optional(),
  SMSAPI_TOKEN: z.string().optional(),
  SMSAPI_FROM: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  META_GRAPH_VERSION: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  DEV_MODE: z.string().optional()
});

export const env = envSchema.parse(process.env);
export const isDevMode = env.DEV_MODE === "1" || env.NODE_ENV === "development";
