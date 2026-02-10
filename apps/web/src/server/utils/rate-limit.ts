import { getRedis } from "@/server/redis";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return true;
  if (!process.env.REDIS_URL) return true;
  if (process.env.REDIS_URL.includes(".internal")) return true;
  const redis = getRedis();
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}
