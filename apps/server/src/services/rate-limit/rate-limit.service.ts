import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { fixedWindowScript, userRowScript, allRowsScript, unpackAllRows } from "./scripts/index.js";
import { ConsumeResult, UserRow } from "../../lib/types/index.js";
import { DEFAULT_LIMIT, WINDOW_SECONDS, NEAR_LIMIT_THRESHOLD } from "../../lib/constants.js";
import { redisKeys } from "../../lib/redis-keys.js";

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  /** Whether the underlying Redis connection is accepting commands. */
  get isHealthy(): boolean {
    return this.redis.status === "ready";
  }

  async consume(userId: string): Promise<ConsumeResult> {
    const today = new Date().toISOString().slice(0, 10);

    const result = (await this.redis.eval(
      fixedWindowScript,
      6,
      redisKeys.userRate(userId),
      redisKeys.userLimit(userId),
      redisKeys.userPaused(userId),
      redisKeys.usersLastSeen,
      redisKeys.stats429(today),
      redisKeys.activityBucket(userId, today),
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
    const today = new Date().toISOString().slice(0, 10);

    const result = (await this.redis.eval(
      userRowScript,
      6,
      redisKeys.userRate(userId),
      redisKeys.userLimit(userId),
      redisKeys.userPaused(userId),
      redisKeys.usersLastSeen,
      redisKeys.userLastReset(userId),
      redisKeys.activityBucket(userId, today),
      userId,
      String(DEFAULT_LIMIT),
    )) as number[] | null;

    if (!result) return null;

    const [used, bonus, pausedCount, limit, windowTtl, pauseTtl, lastRequestAt, now, lastAdminResetAt, rejectedToday] = result;
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
      status: ratio >= 1 ? "exceeded" : ratio >= NEAR_LIMIT_THRESHOLD ? "warning" : "ok",
      lastRequestAt,
      lastAdminResetAt: lastAdminResetAt > 0 ? lastAdminResetAt : null,
      rejectedToday,
      at: now,
    };
  }

  async userExists(userId: string): Promise<boolean> {
    const score = await this.redis.zscore(redisKeys.usersLastSeen, userId);
    return score !== null;
  }

  async readAllRows(): Promise<UserRow[]> {
    const today = new Date().toISOString().slice(0, 10);

    const flat = (await this.redis.eval(
      allRowsScript,
      1,
      redisKeys.usersLastSeen,
      String(DEFAULT_LIMIT),
      today,
    )) as (string | number)[];

    return unpackAllRows(flat);
  }
}
