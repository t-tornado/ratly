import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import Redis from "ioredis-mock";
import { RateLimitService } from "./rate-limit.service.js";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { redisKeys } from "../../lib/redis-keys.js";
import { DEFAULT_LIMIT } from "../../lib/constants.js";

describe("RateLimitService", () => {
  let redis: InstanceType<typeof Redis>;
  let service: RateLimitService;

  beforeEach(async () => {
    redis = new Redis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  afterEach(async () => {
    await redis.flushall();
    redis.disconnect();
  });

  describe("consume", () => {
    const NOW = Date.now();

    it("maps allowed response correctly", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([1, 1, DEFAULT_LIMIT, 3600, NOW, 0]);

      const result = await service.consume("user-1");

      expect(result.allowed).toBe(true);
      expect(result.paused).toBe(false);
      expect(result.used).toBe(1);
      expect(result.allowedTotal).toBe(DEFAULT_LIMIT);
      expect(result.remaining).toBe(DEFAULT_LIMIT - 1);
      expect(result.resetAt).toBe(NOW + 3600 * 1000);
      expect(result.now).toBe(NOW);
    });

    it("maps denied response correctly", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([0, 100, 100, 1800, NOW, 0]);

      const result = await service.consume("user-1");

      expect(result.allowed).toBe(false);
      expect(result.used).toBe(100);
      expect(result.remaining).toBe(0);
    });

    it("maps paused response correctly", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([1, 0, 100, 3600, NOW, 1]);

      const result = await service.consume("user-1");

      expect(result.allowed).toBe(true);
      expect(result.paused).toBe(true);
      expect(result.used).toBe(0);
    });

    it("sets resetAt to null when ttl is not positive", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([1, 1, 100, -2, NOW, 0]);

      const result = await service.consume("user-1");

      expect(result.resetAt).toBeNull();
    });
  });

  describe("readRow", () => {
    const NOW = Date.now();

    it("returns null for unknown user", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce(null);

      const row = await service.readRow("nonexistent");

      expect(row).toBeNull();
    });

    it("maps full row correctly", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce(
        [5, 10, 0, DEFAULT_LIMIT, 3000, -2, NOW - 1000, NOW, 0, 3],
      );

      const row = (await service.readRow("user-1"))!;

      expect(row.userId).toBe("user-1");
      expect(row.used).toBe(5);
      expect(row.bonus).toBe(10);
      expect(row.pausedCount).toBe(0);
      expect(row.limit).toBe(DEFAULT_LIMIT);
      expect(row.allowedTotal).toBe(DEFAULT_LIMIT + 10);
      expect(row.remaining).toBe(DEFAULT_LIMIT + 10 - 5);
      expect(row.resetAt).toBe(NOW + 3000 * 1000);
      expect(row.paused).toBe(false);
      expect(row.pausedUntil).toBeNull();
      expect(row.lastRequestAt).toBe(NOW - 1000);
      expect(row.lastAdminResetAt).toBeNull();
      expect(row.rejectedToday).toBe(3);
      expect(row.at).toBe(NOW);
    });

    it("computes status ok when ratio < 0.9", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([50, 0, 0, 100, -2, -2, NOW, NOW, 0, 0]);
      expect((await service.readRow("u"))!.status).toBe("ok");
    });

    it("computes status warning when ratio >= 0.9", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([95, 0, 0, 100, -2, -2, NOW, NOW, 0, 0]);
      expect((await service.readRow("u"))!.status).toBe("warning");
    });

    it("computes status exceeded when ratio >= 1", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([100, 0, 0, 100, -2, -2, NOW, NOW, 0, 0]);
      expect((await service.readRow("u"))!.status).toBe("exceeded");
    });

    it("includes paused state when pauseTtl > 0", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([5, 0, 2, 100, -2, 300, NOW, NOW, 0, 0]);

      const row = (await service.readRow("u"))!;

      expect(row.paused).toBe(true);
      expect(row.pausedUntil).toBe(NOW + 300 * 1000);
      expect(row.pausedCount).toBe(2);
    });

    it("returns lastAdminResetAt when > 0", async () => {
      const resetTs = NOW - 60_000;
      vi.spyOn(redis, "eval").mockResolvedValueOnce([0, 0, 0, 100, -2, -2, NOW, NOW, resetTs, 0]);
      expect((await service.readRow("u"))!.lastAdminResetAt).toBe(resetTs);
    });
  });

  describe("userExists", () => {
    it("returns false for unknown user", async () => {
      expect(await service.userExists("ghost")).toBe(false);
    });

    it("returns true for user in last_seen set", async () => {
      await redis.zadd(redisKeys.usersLastSeen, String(Date.now()), "user-1");
      expect(await service.userExists("user-1")).toBe(true);
    });
  });

  describe("readAllRows", () => {
    it("returns empty array for empty flat", async () => {
      vi.spyOn(redis, "eval").mockResolvedValueOnce([Date.now()]);
      expect(await service.readAllRows()).toEqual([]);
    });

    it("unpacks multiple users from flat array", async () => {
      const now = Date.now();
      vi.spyOn(redis, "eval").mockResolvedValueOnce([
        now,
        "user-1", 5, 0, 0, 100, 3000, -2, now - 1000, 0, 0,
        "user-2", 90, 0, 0, 100, 2000, -2, now - 2000, 0, 0,
      ]);

      const rows = await service.readAllRows();

      expect(rows).toHaveLength(2);
      expect(rows[0].userId).toBe("user-1");
      expect(rows[0].used).toBe(5);
      expect(rows[0].status).toBe("ok");
      expect(rows[1].userId).toBe("user-2");
      expect(rows[1].used).toBe(90);
      expect(rows[1].status).toBe("warning");
    });
  });
});
