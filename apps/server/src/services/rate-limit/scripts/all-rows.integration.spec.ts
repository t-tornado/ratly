import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { allRowsScript } from "./index.js";

const LAST_SEEN_KEY = "users:last_seen";
const DEFAULT_LIMIT = "100";
const TODAY = "2026-01-01";

function evalAllRows(redis: Redis) {
  return redis.eval(
    allRowsScript, 1,
    LAST_SEEN_KEY,
    DEFAULT_LIMIT, TODAY,
  ) as Promise<(string | number)[]>;
}

const FIELDS_PER_USER = 10;

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("all-rows.lua", () => {
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

  it("returns only now when no users exist", async () => {
    const flat = await evalAllRows(redis);

    expect(flat).toHaveLength(1);
    expect(flat[0]).toBeTypeOf("number");
  });

  it("returns per-user fields for a single user", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "u1");
    await redis.hset("rate:user:u1", "count", "5", "bonus", "10");

    const flat = await evalAllRows(redis);

    expect(flat).toHaveLength(1 + FIELDS_PER_USER);

    const [, userId, count, bonus, pausedCount, limit] = flat;
    expect(userId).toBe("u1");
    expect(count).toBe(5);
    expect(bonus).toBe(10);
    expect(pausedCount).toBe(0);
    expect(limit).toBe(100);
  });

  it("returns multiple users ordered by last_seen descending", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now - 2000), "oldest", String(now), "newest", String(now - 1000), "middle");

    const flat = await evalAllRows(redis);

    expect(flat).toHaveLength(1 + 3 * FIELDS_PER_USER);

    const firstUserId = flat[1];
    const secondUserId = flat[1 + FIELDS_PER_USER];
    const thirdUserId = flat[1 + 2 * FIELDS_PER_USER];

    expect(firstUserId).toBe("newest");
    expect(secondUserId).toBe("middle");
    expect(thirdUserId).toBe("oldest");
  });

  it("uses custom limit when set", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set("limit:user:u1", "50");

    const flat = await evalAllRows(redis);
    const limit = flat[5]; // index: now(0) + userId(1) + count(2) + bonus(3) + pausedCount(4) + limit(5)

    expect(limit).toBe(50);
  });

  it("returns windowTtl for active window", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset("rate:user:u1", "count", "5");
    await redis.expire("rate:user:u1", 1800);

    const flat = await evalAllRows(redis);
    const windowTtl = flat[6]; // index 6

    expect(windowTtl).toBeTypeOf("number");
    expect(windowTtl as number).toBeGreaterThan(0);
    expect(windowTtl as number).toBeLessThanOrEqual(1800);
  });

  it("returns -2 for windowTtl when no active window", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");

    const flat = await evalAllRows(redis);
    const windowTtl = flat[6];

    expect(windowTtl).toBe(-2);
  });

  it("returns pauseTtl for paused user", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set("paused:user:u1", "1", "EX", 300);

    const flat = await evalAllRows(redis);
    const pauseTtl = flat[7]; // index 7

    expect(pauseTtl as number).toBeGreaterThan(0);
    expect(pauseTtl as number).toBeLessThanOrEqual(300);
  });

  it("includes lastResetAt when set", async () => {
    const resetTs = Date.now() - 60_000;
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.set("last_reset:user:u1", String(resetTs));

    const flat = await evalAllRows(redis);
    const lastResetAt = flat[9]; // index 9

    expect(lastResetAt).toBe(resetTs);
  });

  it("sums rejectedToday from activity bucket", async () => {
    await redis.zadd(LAST_SEEN_KEY, String(Date.now()), "u1");
    await redis.hset("activity:user:u1:2026-01-01", "10:00:rejected", "5", "10:01:rejected", "3");

    const flat = await evalAllRows(redis);
    const rejectedToday = flat[10]; // index 10

    expect(rejectedToday).toBe(8);
  });
});
