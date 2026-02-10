import { Redis } from "@upstash/redis";
import type { ActivityEntry } from "./types";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis credentials not set");
  redis = new Redis({ url, token });
  return redis;
}

export async function isProcessed(
  platform: string,
  postId: string
): Promise<boolean> {
  const key = `processed:${platform}:${postId}`;
  const exists = await getRedis().exists(key);
  return exists === 1;
}

export async function markProcessed(
  platform: string,
  postId: string
): Promise<void> {
  const key = `processed:${platform}:${postId}`;
  await getRedis().set(key, "1", { ex: 604800 }); // 7-day TTL
}

export async function addActivity(entry: ActivityEntry): Promise<void> {
  const score = new Date(entry.launchedAt).getTime();
  await getRedis().zadd("activity", { score, member: JSON.stringify(entry) });
  // Trim to last 100 entries
  const count = await getRedis().zcard("activity");
  if (count > 100) {
    await getRedis().zremrangebyrank("activity", 0, count - 101);
  }
}

export async function getRecentActivity(
  limit: number = 20
): Promise<ActivityEntry[]> {
  const raw = await getRedis().zrange("activity", 0, -1, { rev: true });
  const sliced = (raw as string[]).slice(0, limit);
  return sliced.map((s) => (typeof s === "string" ? JSON.parse(s) : s));
}

// ---- Platform token tracking ----

export async function addPlatformToken(tokenMint: string): Promise<void> {
  await getRedis().sadd("platform:tokens", tokenMint);
}

export async function getPlatformTokens(): Promise<string[]> {
  const tokens = await getRedis().smembers("platform:tokens");
  return tokens as string[];
}

export async function isPlatformToken(tokenMint: string): Promise<boolean> {
  const result = await getRedis().sismember("platform:tokens", tokenMint);
  return result === 1;
}

export async function setLastRun(): Promise<void> {
  await getRedis().set("scanner:lastrun", new Date().toISOString());
}

export async function getLastRun(): Promise<string | null> {
  return getRedis().get("scanner:lastrun");
}
