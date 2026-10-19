import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { resetWindowScript } from "./index.js";

const RATE_KEY = "rate:user:u1";
const LAST_RESET_KEY = "last_reset:user:u1";

function evalResetWindow(redis: Redis, nowMs = Date.now()) {
  return redis.eval(resetWindowScript, 2, RATE_KEY, LAST_RESET_KEY, String(nowMs)) as Promise<unknown>;
}

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("reset-window.lua", () => {
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

  it("deletes the rate key", async () => {
    await redis.hset(RATE_KEY, "count", "50", "bonus", "10");
    await redis.expire(RATE_KEY, 3600);

    await evalResetWindow(redis);

    const exists = await redis.exists(RATE_KEY);
    expect(exists).toBe(0);
  });

  it("sets last_reset timestamp", async () => {
    const nowMs = Date.now();
    await redis.hset(RATE_KEY, "count", "50");

    await evalResetWindow(redis, nowMs);

    const stored = await redis.get(LAST_RESET_KEY);
    expect(stored).toBe(String(nowMs));
  });

  it("works when rate key does not exist", async () => {
    const nowMs = Date.now();

    await evalResetWindow(redis, nowMs);

    const exists = await redis.exists(RATE_KEY);
    expect(exists).toBe(0);

    const stored = await redis.get(LAST_RESET_KEY);
    expect(stored).toBe(String(nowMs));
  });

  it("overwrites previous last_reset timestamp", async () => {
    const firstReset = Date.now() - 60_000;
    const secondReset = Date.now();

    await evalResetWindow(redis, firstReset);
    await evalResetWindow(redis, secondReset);

    const stored = await redis.get(LAST_RESET_KEY);
    expect(stored).toBe(String(secondReset));
  });

  it("removes all hash fields including bonus and paused", async () => {
    await redis.hset(RATE_KEY, "count", "50", "bonus", "10", "paused", "3");
    await redis.expire(RATE_KEY, 3600);

    await evalResetWindow(redis);

    const count = await redis.hget(RATE_KEY, "count");
    const bonus = await redis.hget(RATE_KEY, "bonus");
    const paused = await redis.hget(RATE_KEY, "paused");

    expect(count).toBeNull();
    expect(bonus).toBeNull();
    expect(paused).toBeNull();
  });
});
