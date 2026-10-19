import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { userRowScript } from "./index.js";

const RATE_KEY = "rate:user:u1";
const LIMIT_KEY = "limit:user:u1";
const PAUSED_KEY = "paused:user:u1";
const LAST_SEEN_KEY = "users:last_seen";
const LAST_RESET_KEY = "last_reset:user:u1";
const ACTIVITY_KEY = "activity:user:u1:2026-01-01";
const DEFAULT_LIMIT = "100";

function evalUserRow(redis: Redis) {
  return redis.eval(
    userRowScript, 6,
    RATE_KEY, LIMIT_KEY, PAUSED_KEY, LAST_SEEN_KEY, LAST_RESET_KEY, ACTIVITY_KEY,
    "u1", DEFAULT_LIMIT,
  ) as Promise<number[] | null>;
}

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("user-row.lua", () => {
  let redis: Redis;

  beforeEach(async () => {
    redis = createTestRedis();
    await redis.connect();
    await redis.flushdb();
  });

  afterEach(async () => {
    await redis.flushdb();
    redis.disconnect();
  });

  it("returns null for unknown user", async () => {
    const result = await evalUserRow(redis);
    expect(result).toBeNull();
  });

  it("returns correct fields for user with no rate hash", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");

    const result = await evalUserRow(redis);

    expect(result).not.toBeNull();
    const [count, bonus, pausedCount, limit, windowTtl, pauseTtl, lastSeen, now, lastResetAt, rejectedToday] = result!;

    expect(count).toBe(0);
    expect(bonus).toBe(0);
    expect(pausedCount).toBe(0);
    expect(limit).toBe(100);
    expect(windowTtl).toBe(-2);
    expect(pauseTtl).toBe(-2);
    expect(lastSeen).toBeTypeOf("number");
    expect(now).toBeTypeOf("number");
    expect(lastResetAt).toBe(0);
    expect(rejectedToday).toBe(0);
  });

  it("returns count and bonus from rate hash", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset(RATE_KEY, "count", "42", "bonus", "10");

    const [count, bonus] = (await evalUserRow(redis))!;

    expect(count).toBe(42);
    expect(bonus).toBe(10);
  });

  it("returns custom limit when set", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set(LIMIT_KEY, "50");

    const [, , , limit] = (await evalUserRow(redis))!;

    expect(limit).toBe(50);
  });

  it("returns positive windowTtl when rate key has TTL", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 1800);

    const [, , , , windowTtl] = (await evalUserRow(redis))!;

    expect(windowTtl).toBeGreaterThan(0);
    expect(windowTtl).toBeLessThanOrEqual(1800);
  });

  it("returns positive pauseTtl when user is paused", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set(PAUSED_KEY, "1", "EX", 300);

    const [, , , , , pauseTtl] = (await evalUserRow(redis))!;

    expect(pauseTtl).toBeGreaterThan(0);
    expect(pauseTtl).toBeLessThanOrEqual(300);
  });

  it("returns -2 for pauseTtl when not paused", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");

    const [, , , , , pauseTtl] = (await evalUserRow(redis))!;

    expect(pauseTtl).toBe(-2);
  });

  it("returns lastResetAt when set", async () => {
    const resetTs = Date.now() - 60_000;
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set(LAST_RESET_KEY, String(resetTs));

    const [, , , , , , , , lastResetAt] = (await evalUserRow(redis))!;

    expect(lastResetAt).toBe(resetTs);
  });

  it("returns 0 for lastResetAt when not set", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");

    const [, , , , , , , , lastResetAt] = (await evalUserRow(redis))!;

    expect(lastResetAt).toBe(0);
  });

  it("sums rejected activity fields for rejectedToday", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset(ACTIVITY_KEY, "10:00:rejected", "5", "10:01:rejected", "3", "10:00:allowed", "20");

    const [, , , , , , , , , rejectedToday] = (await evalUserRow(redis))!;

    expect(rejectedToday).toBe(8);
  });

  it("returns pausedCount from hash", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset(RATE_KEY, "paused", "7");

    const [, , pausedCount] = (await evalUserRow(redis))!;

    expect(pausedCount).toBe(7);
  });
});
