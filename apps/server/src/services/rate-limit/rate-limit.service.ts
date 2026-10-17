import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { fixedWindowScript, userRowScript } from "./scripts/index.js";
import { ConsumeResult, UserRow } from "../../lib/types/index.js";
import { DEFAULT_LIMIT, WINDOW_SECONDS } from "../../lib/constants.js";

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(userId: string): Promise<ConsumeResult> {
    const today = new Date().toISOString().slice(0, 10);

    const result = (await this.redis.eval(
      fixedWindowScript,
      5,
      `rate:user:${userId}`,
      `limit:user:${userId}`,
      `paused:user:${userId}`,
      "users:last_seen",
      `stats:429:${today}`,
      userId,
      String(DEFAULT_LIMIT),
      String(WINDOW_SECONDS),
    )) as number[];

    const [allowed, used, allowedTotal, ttl, now, paused] = result;

    return {
      allowed: allowed === 1,
      paused: paused === 1,
      used,
      allowedTotal,
      remaining: Math.max(0, allowedTotal - used),
      resetAt: ttl > 0 ? now + ttl * 1000 : null,
      now,
    };
  }

  async readRow(userId: string): Promise<UserRow | null> {
    const result = (await this.redis.eval(
      userRowScript,
      4,
      `rate:user:${userId}`,
      `limit:user:${userId}`,
      `paused:user:${userId}`,
      "users:last_seen",
      userId,
      String(DEFAULT_LIMIT),
    )) as number[] | null;

    if (!result) return null;

    const [used, bonus, pausedCount, limit, windowTtl, pauseTtl, lastRequestAt, now] = result;
    const allowedTotal = limit + bonus;
    const ratio = allowedTotal > 0 ? used / allowedTotal : 0;

    return {
      userId,
      used,
      limit,
      bonus,
      allowedTotal,
      remaining: Math.max(0, allowedTotal - used),
      pausedCount,
      paused: pauseTtl > 0,
      pausedUntil: pauseTtl > 0 ? now + pauseTtl * 1000 : null,
      resetAt: windowTtl > 0 ? now + windowTtl * 1000 : null,
      status: ratio >= 1 ? "exceeded" : ratio >= 0.9 ? "warning" : "ok",
      lastRequestAt,
      at: now,
    };
  }

  async userExists(userId: string): Promise<boolean> {
    const score = await this.redis.zscore("users:last_seen", userId);
    return score !== null;
  }

  async readAllRows(): Promise<UserRow[]> {
    const userIds = await this.redis.zrange("users:last_seen", 0, -1, "REV");
    const rows = await Promise.all(userIds.map((id) => this.readRow(id)));
    return rows.filter((row): row is UserRow => row !== null);
  }
}
