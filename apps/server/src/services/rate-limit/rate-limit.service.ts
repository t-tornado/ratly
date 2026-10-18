import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { fixedWindowScript, userRowScript, allRowsScript } from "./scripts/index.js";
import { ConsumeResult, UserRow } from "../../lib/types/index.js";
import { DEFAULT_LIMIT, WINDOW_SECONDS } from "../../lib/constants.js";
import { redisKeys } from "../../lib/redis-keys.js";

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(userId: string): Promise<ConsumeResult> {
    const today = new Date().toISOString().slice(0, 10);

    const result = (await this.redis.eval(
      fixedWindowScript,
      5,
      redisKeys.userRate(userId),
      redisKeys.userLimit(userId),
      redisKeys.userPaused(userId),
      redisKeys.usersLastSeen,
      redisKeys.stats429(today),
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
      redisKeys.userRate(userId),
      redisKeys.userLimit(userId),
      redisKeys.userPaused(userId),
      redisKeys.usersLastSeen,
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
    const score = await this.redis.zscore(redisKeys.usersLastSeen, userId);
    return score !== null;
  }

  async readAllRows(): Promise<UserRow[]> {
    const flat = (await this.redis.eval(
      allRowsScript,
      1,
      redisKeys.usersLastSeen,
      String(DEFAULT_LIMIT),
    )) as (string | number)[];

    if (!flat || flat.length < 1) return [];

    const now = flat[0] as number;
    const rows: UserRow[] = [];
    const USER_FIELD_COUNT = 8;

    for (let i = 1; i + USER_FIELD_COUNT <= flat.length + 1; i += USER_FIELD_COUNT) {
      const userId      = flat[i] as string;
      const used        = flat[i + 1] as number;
      const bonus       = flat[i + 2] as number;
      const pausedCount = flat[i + 3] as number;
      const limit       = flat[i + 4] as number;
      const windowTtl   = flat[i + 5] as number;
      const pauseTtl    = flat[i + 6] as number;
      const lastSeen    = flat[i + 7] as number;

      const allowedTotal = limit + bonus;
      const ratio = allowedTotal > 0 ? used / allowedTotal : 0;

      rows.push({
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
        lastRequestAt: lastSeen,
        at: now,
      });
    }

    return rows;
  }
}
