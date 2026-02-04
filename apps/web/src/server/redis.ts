import { env } from "@/server/env";
import IORedis, { RedisOptions } from "ioredis";

let redis: IORedis | null = null;

function parseRedisUrl(url: string): RedisOptions {
  try {
    const parsed = new URL(url);
    const db = parsed.pathname ? Number(parsed.pathname.replace("/", "")) : undefined;
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      db: Number.isNaN(db) ? undefined : db,
      maxRetriesPerRequest: null
    };
  } catch {
    return { maxRetriesPerRequest: null };
  }
}

export function getRedisOptions() {
  return parseRedisUrl(env.REDIS_URL);
}

export function getRedis() {
  if (!redis) {
    redis = new IORedis(env.REDIS_URL, getRedisOptions());
  }
  return redis;
}
