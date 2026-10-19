import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import { createTestRedis, isRedisAvailable } from "../../../test/redisTestClient.js";
import { addExtraScript } from "./index.js";

const RATE_KEY = "rate:user:u1";

function evalAddExtra(redis: Redis, amount: number) {
  return redis.eval(addExtraScript, 1, RATE_KEY, String(amount)) as Promise<number>;
}

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("add-extra.lua", () => {
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

  it("returns -1 when no active window exists", async () => {
    const result = await evalAddExtra(redis, 10);
    expect(result).toBe(-1);
  });

  it("increments bonus on active window and returns new value", async () => {
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 3600);

    const result = await evalAddExtra(redis, 10);

    expect(result).toBe(10);
  });

  it("accumulates bonus across multiple calls", async () => {
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 3600);

    await evalAddExtra(redis, 10);
    const result = await evalAddExtra(redis, 5);

    expect(result).toBe(15);
  });

  it("does not modify count field", async () => {
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 3600);

    await evalAddExtra(redis, 10);

    const count = await redis.hget(RATE_KEY, "count");
    expect(count).toBe("5");
  });

  it("stores bonus in hash field", async () => {
    await redis.hset(RATE_KEY, "count", "5");
    await redis.expire(RATE_KEY, 3600);

    await evalAddExtra(redis, 25);

    const bonus = await redis.hget(RATE_KEY, "bonus");
    expect(bonus).toBe("25");
  });
});
