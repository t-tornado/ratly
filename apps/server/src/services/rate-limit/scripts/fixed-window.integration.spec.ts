import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { fixedWindowScript } from "./index.js";

const RATE_KEY = "rate:user:u1";
const LIMIT_KEY = "limit:user:u1";
const PAUSED_KEY = "paused:user:u1";
const LAST_SEEN_KEY = "users:last_seen";
const STATS_429_KEY = "stats:429:2026-01-01";
const ACTIVITY_KEY = "activity:user:u1:2026-01-01";
const DEFAULT_LIMIT = "100";
const WINDOW_SECONDS = "3600";

function evalFixedWindow(redis: Redis, userId = "u1", limit = DEFAULT_LIMIT) {
  return redis.eval(
    fixedWindowScript, 6,
    RATE_KEY, LIMIT_KEY, PAUSED_KEY, LAST_SEEN_KEY, STATS_429_KEY, ACTIVITY_KEY,
    userId, limit, WINDOW_SECONDS,
  ) as Promise<number[]>;
}

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("fixed-window.lua", () => {
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

  it("allows a fresh user and returns count = 1", async () => {
    const [allowed, count, allowedTotal, ttl, now, paused] = await evalFixedWindow(redis);

    expect(allowed).toBe(1);
    expect(count).toBe(1);
    expect(allowedTotal).toBe(100);
    expect(ttl).toBeGreaterThan(0);
    expect(now).toBeTypeOf("number");
    expect(paused).toBe(0);
  });

  it("registers user in last_seen sorted set", async () => {
    await evalFixedWindow(redis);

    const score = await redis.zscore(LAST_SEEN_KEY, "u1");
    expect(score).not.toBeNull();
  });

  it("creates rate hash with count field", async () => {
    await evalFixedWindow(redis);

    const count = await redis.hget(RATE_KEY, "count");
    expect(count).toBe("1");
  });

  it("sets TTL on rate key for the window duration", async () => {
    await evalFixedWindow(redis);

    const ttl = await redis.ttl(RATE_KEY);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(3600);
  });

  it("increments count on successive calls", async () => {
    await evalFixedWindow(redis);
    const [, count] = await evalFixedWindow(redis);

    expect(count).toBe(2);
  });

  it("denies when count reaches the limit", async () => {
    await redis.hset(RATE_KEY, "count", "100");
    await redis.expire(RATE_KEY, 3600);

    const [allowed, count, allowedTotal] = await evalFixedWindow(redis);

    expect(allowed).toBe(0);
    expect(count).toBe(100);
    expect(allowedTotal).toBe(100);
  });

  it("does not increment count on denial", async () => {
    await redis.hset(RATE_KEY, "count", "100");
    await redis.expire(RATE_KEY, 3600);

    await evalFixedWindow(redis);

    const count = await redis.hget(RATE_KEY, "count");
    expect(count).toBe("100");
  });

  it("increments 429 stats counter on denial", async () => {
    await redis.hset(RATE_KEY, "count", "100");
    await redis.expire(RATE_KEY, 3600);

    await evalFixedWindow(redis);

    const rejected = await redis.get(STATS_429_KEY);
    expect(rejected).toBe("1");
  });

  it("uses custom limit when set", async () => {
    await redis.set(LIMIT_KEY, "5");

    const [allowed, count, allowedTotal] = await evalFixedWindow(redis);

    expect(allowed).toBe(1);
    expect(count).toBe(1);
    expect(allowedTotal).toBe(5);
  });

  it("denies at custom limit", async () => {
    await redis.set(LIMIT_KEY, "5");
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 3600);

    const [allowed] = await evalFixedWindow(redis);

    expect(allowed).toBe(0);
  });

  it("allows paused user without incrementing count", async () => {
    await redis.set(PAUSED_KEY, "1", "EX", 600);

    const [allowed, count, , , , paused] = await evalFixedWindow(redis);

    expect(allowed).toBe(1);
    expect(paused).toBe(1);
    expect(count).toBe(0);
  });

  it("increments paused counter in hash for paused user", async () => {
    await redis.set(PAUSED_KEY, "1", "EX", 600);

    await evalFixedWindow(redis);
    await evalFixedWindow(redis);

    const pausedCount = await redis.hget(RATE_KEY, "paused");
    expect(pausedCount).toBe("2");
  });

  it("respects bonus in allowed total", async () => {
    await redis.hset(RATE_KEY, "count", "95", "bonus", "10");
    await redis.expire(RATE_KEY, 3600);

    const [allowed, count, allowedTotal] = await evalFixedWindow(redis);

    expect(allowed).toBe(1);
    expect(count).toBe(96);
    expect(allowedTotal).toBe(110);
  });

  it("tracks allowed activity in bucket", async () => {
    await evalFixedWindow(redis);

    const fields = await redis.hgetall(ACTIVITY_KEY);
    const allowedFields = Object.keys(fields).filter((k) => k.endsWith(":allowed"));
    expect(allowedFields).toHaveLength(1);
    expect(fields[allowedFields[0]]).toBe("1");
  });

  it("tracks rejected activity in bucket", async () => {
    await redis.hset(RATE_KEY, "count", "100");
    await redis.expire(RATE_KEY, 3600);

    await evalFixedWindow(redis);

    const fields = await redis.hgetall(ACTIVITY_KEY);
    const rejectedFields = Object.keys(fields).filter((k) => k.endsWith(":rejected"));
    expect(rejectedFields).toHaveLength(1);
    expect(fields[rejectedFields[0]]).toBe("1");
  });
});
