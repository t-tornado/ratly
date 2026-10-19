import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { dashboardStatsScript } from "./index.js";

const LAST_SEEN_KEY = "users:last_seen";
const STATS_429_KEY = "stats:429:2026-01-01";
const ACTIVE_WINDOW_MS = "900000";
const DEFAULT_LIMIT = "100";
const TOP_N = "10";
const NEAR_THRESHOLD = "0.9";

function evalDashboardStats(redis: Redis) {
  return redis.eval(
    dashboardStatsScript, 2,
    LAST_SEEN_KEY, STATS_429_KEY,
    ACTIVE_WINDOW_MS, DEFAULT_LIMIT, TOP_N, NEAR_THRESHOLD,
  ) as Promise<(string | number)[]>;
}

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("dashboard-stats.lua", () => {
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

  it("returns zeros when no users exist", async () => {
    const [total, active, rejected, now, nearLimitPercent] = await evalDashboardStats(redis);

    expect(total).toBe(0);
    expect(active).toBe(0);
    expect(rejected).toBe(0);
    expect(now).toBeTypeOf("number");
    expect(nearLimitPercent).toBe(0);
  });

  it("counts total users from sorted set", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "u1", String(now - 1000), "u2", String(now - 2000), "u3");

    const [total] = await evalDashboardStats(redis);

    expect(total).toBe(3);
  });

  it("counts active users within the window", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "active1", String(now - 100_000), "active2", String(now - 2_000_000), "inactive");

    const [, active] = await evalDashboardStats(redis);

    expect(active).toBe(2);
  });

  it("reads rejected count from stats key", async () => {
    await redis.set(STATS_429_KEY, "42");

    const [, , rejected] = await evalDashboardStats(redis);

    expect(rejected).toBe(42);
  });

  it("returns top users sorted by count descending", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "u1", String(now), "u2", String(now), "u3");
    await redis.hset("rate:user:u1", "count", "10");
    await redis.expire("rate:user:u1", 3600);
    await redis.hset("rate:user:u2", "count", "50");
    await redis.expire("rate:user:u2", 3600);
    await redis.hset("rate:user:u3", "count", "30");
    await redis.expire("rate:user:u3", 3600);

    const raw = await evalDashboardStats(redis);
    const topUsers = raw.slice(5);

    // 3 users × 3 fields each = 9
    expect(topUsers).toHaveLength(9);

    // First user should be u2 (highest count = 50)
    expect(topUsers[0]).toBe("u2");
    expect(topUsers[1]).toBe(50);

    // Second should be u3 (count = 30)
    expect(topUsers[3]).toBe("u3");
    expect(topUsers[4]).toBe(30);

    // Third should be u1 (count = 10)
    expect(topUsers[6]).toBe("u1");
    expect(topUsers[7]).toBe(10);
  });

  it("limits top users to top N", async () => {
    const now = Date.now();
    // Seed 12 users, but top N = 10
    for (let i = 1; i <= 12; i++) {
      const uid = `u${i}`;
      await redis.zadd(LAST_SEEN_KEY, String(now), uid);
      await redis.hset(`rate:user:${uid}`, "count", String(i));
      await redis.expire(`rate:user:${uid}`, 3600);
    }

    const raw = await evalDashboardStats(redis);
    const topUsers = raw.slice(5);

    // 10 users × 3 fields = 30
    expect(topUsers).toHaveLength(30);
  });

  it("skips users with no active window (count 0)", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "active", String(now), "idle");
    await redis.hset("rate:user:active", "count", "10");
    await redis.expire("rate:user:active", 3600);
    // "idle" has no rate hash → count 0

    const raw = await evalDashboardStats(redis);
    const topUsers = raw.slice(5);

    expect(topUsers).toHaveLength(3); // only "active"
    expect(topUsers[0]).toBe("active");
  });

  it("computes nearLimitPercent correctly", async () => {
    const now = Date.now();
    // 2 users with active windows: one near limit, one not
    await redis.zadd(LAST_SEEN_KEY, String(now), "near", String(now), "safe");
    await redis.hset("rate:user:near", "count", "95");
    await redis.expire("rate:user:near", 3600);
    await redis.hset("rate:user:safe", "count", "10");
    await redis.expire("rate:user:safe", 3600);

    const [, , , , nearLimitPercent] = await evalDashboardStats(redis);

    // 1 out of 2 active window users is near limit = 50%
    expect(nearLimitPercent).toBe(50);
  });

  it("includes bonus in allowed total for top users", async () => {
    const now = Date.now();
    await redis.zadd(LAST_SEEN_KEY, String(now), "u1");
    await redis.hset("rate:user:u1", "count", "10", "bonus", "20");
    await redis.expire("rate:user:u1", 3600);

    const raw = await evalDashboardStats(redis);
    const allowedTotal = raw[7]; // topUsers[2] = allowed

    expect(allowedTotal).toBe(120); // 100 + 20
  });
});
