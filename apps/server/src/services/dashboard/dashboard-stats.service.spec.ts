/**
 * Constraint: ioredis-mock does not support `eval` — Lua scripts return
 * undefined instead of the expected array. Services that call `redis.eval`
 * must use `vi.fn()` mocks for the Redis layer.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { getLoggerToken } from "nestjs-pino";
import { DashboardStatsService } from "./dashboard-stats.service.js";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { redisKeys } from "../../lib/redis-keys.js";
import { dashboardStatsScript } from "../rate-limit/scripts/index.js";
import {
  ACTIVE_WINDOW_MS,
  DEFAULT_LIMIT,
  TOP_USERS_COUNT,
  NEAR_LIMIT_THRESHOLD,
} from "../../lib/constants.js";

const silentLogger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

describe("DashboardStatsService", () => {
  let service: DashboardStatsService;
  let mockRedis: { eval: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRedis = { eval: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardStatsService,
        { provide: RedisService, useValue: mockRedis },
        { provide: getLoggerToken(DashboardStatsService.name), useValue: silentLogger },
      ],
    }).compile();

    service = module.get<DashboardStatsService>(DashboardStatsService);
  });

  it("passes correct script, keys, and args to eval", async () => {
    mockRedis.eval.mockResolvedValue([0, 0, 0, 1700000000000, 0]);

    await service.getStats();

    const today = new Date().toISOString().slice(0, 10);
    expect(mockRedis.eval).toHaveBeenCalledWith(
      dashboardStatsScript,
      2,
      redisKeys.usersLastSeen,
      redisKeys.stats429(today),
      String(ACTIVE_WINDOW_MS),
      String(DEFAULT_LIMIT),
      String(TOP_USERS_COUNT),
      String(NEAR_LIMIT_THRESHOLD),
    );
  });

  it("maps Lua output to DashboardStats with top users", async () => {
    mockRedis.eval.mockResolvedValue([
      42, 10, 5, 1700000000000, 15,
      "user-a", 80, 100,
      "user-b", 45, 50,
    ]);

    const stats = await service.getStats();

    expect(stats.totalUsers).toBe(42);
    expect(stats.activeUsers).toBe(10);
    expect(stats.rejectedToday).toBe(5);
    expect(stats.at).toBe(1700000000000);
    expect(stats.nearLimitPercent).toBe(15);
    expect(stats.topUsers).toHaveLength(2);
    expect(stats.topUsers[0]).toEqual({ userId: "user-a", used: 80, allowedTotal: 100 });
    expect(stats.topUsers[1]).toEqual({ userId: "user-b", used: 45, allowedTotal: 50 });
  });

  it("handles empty top users list", async () => {
    mockRedis.eval.mockResolvedValue([10, 3, 0, 1700000000000, 0]);

    const stats = await service.getStats();

    expect(stats.totalUsers).toBe(10);
    expect(stats.topUsers).toHaveLength(0);
  });

  it("includes all top users from Lua output", async () => {
    mockRedis.eval.mockResolvedValue([
      100, 20, 8, 1700000000000, 25,
      "u1", 90, 100,
      "u2", 85, 100,
      "u3", 80, 100,
    ]);

    const stats = await service.getStats();

    expect(stats.topUsers).toHaveLength(3);
    expect(stats.topUsers.map((u) => u.userId)).toEqual(["u1", "u2", "u3"]);
  });
});
