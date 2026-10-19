import Redis from "ioredis";
import { redisKeys } from "../lib/redis-keys.js";

interface SeedUserOptions {
  userId: string;
  count?: number;
  bonus?: number;
  limit?: number;
  pauseSeconds?: number;
  windowTtl?: number;
}

const DEFAULT_WINDOW_TTL = 3600;

export async function seedUser(redis: Redis, options: SeedUserOptions): Promise<void> {
  const { userId, count = 0, bonus = 0, limit, pauseSeconds, windowTtl = DEFAULT_WINDOW_TTL } = options;

  await redis.zadd(redisKeys.usersLastSeen, String(Date.now()), userId);

  if (count > 0 || bonus > 0) {
    const rateKey = redisKeys.userRate(userId);
    const fields: [string, string][] = [["count", String(count)]];
    if (bonus > 0) fields.push(["bonus", String(bonus)]);
    await redis.hset(rateKey, ...fields.flat());
    await redis.expire(rateKey, windowTtl);
  }

  if (limit !== undefined) {
    await redis.set(redisKeys.userLimit(userId), String(limit));
  }

  if (pauseSeconds !== undefined) {
    await redis.set(redisKeys.userPaused(userId), "1", "EX", pauseSeconds);
  }
}
