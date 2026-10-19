/**
 * Constraint: ioredis-mock has incompatibility issues with some lua commands through `eval`. Services that call `redis.eval`
 * must use `vi.fn()` mocks for the Redis layer.
 *
 * @see RateLimitService — also mocked here since AdminService delegates to it
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { AdminService } from "./admin.service.js";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { RateLimitService } from "../rate-limit/rate-limit.service.js";
import { UserRow } from "../../lib/types/index.js";
import {
  DEFAULT_LIMIT,
  MIN_PAUSE_SECONDS,
  MAX_PAUSE_SECONDS,
} from "../../lib/constants.js";
import { redisKeys } from "../../lib/redis-keys.js";
import { resetWindowScript, addExtraScript } from "../rate-limit/scripts/index.js";

const NOW = Date.now();

function makeUserRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    userId: "user-1",
    used: 1,
    limit: DEFAULT_LIMIT,
    bonus: 0,
    allowedTotal: DEFAULT_LIMIT,
    remaining: DEFAULT_LIMIT - 1,
    pausedCount: 0,
    paused: false,
    pausedUntil: null,
    resetAt: NOW + 3600_000,
    status: "ok",
    lastRequestAt: NOW,
    lastAdminResetAt: null,
    rejectedToday: 0,
    at: NOW,
    ...overrides,
  };
}

describe("AdminService", () => {
  let service: AdminService;
  let mockRedis: Record<string, ReturnType<typeof vi.fn>>;
  let mockRateLimitService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockRedis = {
      eval: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      hgetall: vi.fn().mockResolvedValue({}),
    };

    mockRateLimitService = {
      readRow: vi.fn(),
      userExists: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: RedisService, useValue: mockRedis },
        { provide: RateLimitService, useValue: mockRateLimitService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe("getUser", () => {
    it("returns row for existing user", async () => {
      const row = makeUserRow();
      mockRateLimitService.readRow.mockResolvedValue(row);

      expect(await service.getUser("user-1")).toBe(row);
    });

    it("throws NotFoundException for unknown user", async () => {
      mockRateLimitService.readRow.mockResolvedValue(null);

      await expect(service.getUser("ghost")).rejects.toThrow(NotFoundException);
    });
  });

  describe("resetWindow", () => {
    it("calls eval with reset script, correct keys, and returns updated row", async () => {
      const row = makeUserRow();
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.eval.mockResolvedValue(undefined);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.resetWindow("user-1");

      expect(mockRedis.eval).toHaveBeenCalledWith(
        resetWindowScript,
        2,
        redisKeys.userRate("user-1"),
        redisKeys.userLastReset("user-1"),
        expect.any(String),
      );
      expect(result).toBe(row);
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.resetWindow("ghost")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.eval).not.toHaveBeenCalled();
    });
  });

  describe("adjustLimit", () => {
    it("sets correct Redis key with stringified limit and returns updated row", async () => {
      const row = makeUserRow({ limit: 50, allowedTotal: 50 });
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.adjustLimit("user-1", 50);

      expect(mockRedis.set).toHaveBeenCalledWith(
        redisKeys.userLimit("user-1"),
        "50",
      );
      expect(result).toBe(row);
    });

    it("throws BadRequestException for non-integer limit", async () => {
      await expect(service.adjustLimit("user-1", 1.5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws BadRequestException for limit < 1", async () => {
      await expect(service.adjustLimit("user-1", 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.adjustLimit("ghost", 50)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe("resetLimitToDefault", () => {
    it("deletes correct limit key and returns updated row", async () => {
      const row = makeUserRow();
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.resetLimitToDefault("user-1");

      expect(mockRedis.del).toHaveBeenCalledWith(redisKeys.userLimit("user-1"));
      expect(result).toBe(row);
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.resetLimitToDefault("ghost")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("addExtra", () => {
    it("calls eval with addExtra script, correct key and amount", async () => {
      const row = makeUserRow({ bonus: 10, allowedTotal: DEFAULT_LIMIT + 10 });
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.eval.mockResolvedValue(10);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.addExtra("user-1", 10);

      expect(mockRedis.eval).toHaveBeenCalledWith(
        addExtraScript,
        1,
        redisKeys.userRate("user-1"),
        "10",
      );
      expect(result).toBe(row);
    });

    it("throws ConflictException when no active window", async () => {
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.eval.mockResolvedValue(-1);

      await expect(service.addExtra("user-1", 10)).rejects.toThrow(
        ConflictException,
      );
    });

    it("throws BadRequestException for non-integer amount", async () => {
      await expect(service.addExtra("user-1", 1.5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws BadRequestException for amount < 1", async () => {
      await expect(service.addExtra("user-1", 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.addExtra("ghost", 10)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.eval).not.toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("sets pause key with EX flag and correct TTL", async () => {
      const row = makeUserRow({ paused: true, pausedUntil: NOW + 300_000 });
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.pause("user-1", 300);

      expect(mockRedis.set).toHaveBeenCalledWith(
        redisKeys.userPaused("user-1"),
        "1",
        "EX",
        300,
      );
      expect(result).toBe(row);
    });

    it("throws BadRequestException below MIN_PAUSE_SECONDS", async () => {
      await expect(
        service.pause("user-1", MIN_PAUSE_SECONDS - 1),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException above MAX_PAUSE_SECONDS", async () => {
      await expect(
        service.pause("user-1", MAX_PAUSE_SECONDS + 1),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException for non-integer seconds", async () => {
      await expect(service.pause("user-1", 60.5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.pause("ghost", 300)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe("unlock", () => {
    it("deletes correct pause key and returns updated row", async () => {
      const row = makeUserRow({ paused: false, pausedUntil: null });
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRateLimitService.readRow.mockResolvedValue(row);

      const result = await service.unlock("user-1");

      expect(mockRedis.del).toHaveBeenCalledWith(redisKeys.userPaused("user-1"));
      expect(result).toBe(row);
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.unlock("ghost")).rejects.toThrow(NotFoundException);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("getActivity", () => {
    it("returns hour buckets with correct structure", async () => {
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.hgetall.mockResolvedValue({});

      const result = await service.getActivity("user-1", "hour");

      expect(result.range).toBe("hour");
      expect(result.bucketSize).toBe("1m");
      expect(result.buckets).toHaveLength(60);
      expect(result.buckets[0]).toHaveProperty("time");
      expect(result.buckets[0]).toHaveProperty("allowed");
      expect(result.buckets[0]).toHaveProperty("rejected");
    });

    it("returns day buckets with correct structure", async () => {
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.hgetall.mockResolvedValue({});

      const result = await service.getActivity("user-1", "day");

      expect(result.range).toBe("day");
      expect(result.bucketSize).toBe("30m");
      expect(result.buckets).toHaveLength(48);
    });

    it("parses activity fields into correct bucket counts", async () => {
      mockRateLimitService.userExists.mockResolvedValue(true);

      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");

      mockRedis.hgetall
        .mockResolvedValueOnce({ [`${hours}:${minutes}:allowed`]: "3", [`${hours}:${minutes}:rejected`]: "1" })
        .mockResolvedValueOnce({});

      const result = await service.getActivity("user-1", "hour");

      const lastBucket = result.buckets[result.buckets.length - 1];
      expect(lastBucket.time).toBe(`${hours}:${minutes}`);
      expect(lastBucket.allowed).toBe(3);
      expect(lastBucket.rejected).toBe(1);
    });

    it("zeroes buckets with no activity data", async () => {
      mockRateLimitService.userExists.mockResolvedValue(true);
      mockRedis.hgetall.mockResolvedValue({});

      const result = await service.getActivity("user-1", "hour");

      result.buckets.forEach((bucket) => {
        expect(bucket.allowed).toBe(0);
        expect(bucket.rejected).toBe(0);
      });
    });

    it("throws BadRequestException for invalid range", async () => {
      await expect(service.getActivity("user-1", "week")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws BadRequestException for missing range", async () => {
      await expect(service.getActivity("user-1", undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("throws NotFoundException if user does not exist", async () => {
      mockRateLimitService.userExists.mockResolvedValue(false);

      await expect(service.getActivity("ghost", "hour")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
