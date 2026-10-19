import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test } from "@nestjs/testing";
import { NestFastifyApplication, FastifyAdapter } from "@nestjs/platform-fastify";
import request from "supertest";
import { DashboardController } from "./dashboard.controller.js";
import { DashboardStatsService } from "../../services/dashboard/dashboard-stats.service.js";
import { RateLimitService } from "../../services/rate-limit/rate-limit.service.js";
import { DashboardStats, UserRow } from "../../lib/types/index.js";
import { DEFAULT_LIMIT } from "../../lib/constants.js";

const NOW = Date.now();

function makeStats(): DashboardStats {
  return {
    totalUsers: 5,
    activeUsers: 3,
    rejectedToday: 12,
    nearLimitPercent: 0.2,
    topUsers: [{ userId: "user-1", used: 8, allowedTotal: DEFAULT_LIMIT }],
    at: NOW,
  };
}

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

describe("DashboardController (HTTP)", () => {
  let app: NestFastifyApplication;
  let mockStatsService: Record<string, ReturnType<typeof vi.fn>>;
  let mockRateLimitService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockStatsService = { getStats: vi.fn() };
    mockRateLimitService = { readAllRows: vi.fn() };

    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardStatsService, useValue: mockStatsService },
        { provide: RateLimitService, useValue: mockRateLimitService },
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 with stats and rows", async () => {
    const stats = makeStats();
    const rows = [makeUserRow()];
    mockStatsService.getStats.mockResolvedValue(stats);
    mockRateLimitService.readAllRows.mockResolvedValue(rows);

    const res = await request(app.getHttpServer())
      .get("/admin/dashboard")
      .expect(200);

    expect(res.body.stats.totalUsers).toBe(5);
    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0].userId).toBe("user-1");
  });

  it("calls both services in parallel", async () => {
    const statsPromise = new Promise<DashboardStats>((resolve) => {
      setTimeout(() => resolve(makeStats()), 10);
    });
    const rowsPromise = new Promise<UserRow[]>((resolve) => {
      setTimeout(() => resolve([makeUserRow()]), 10);
    });

    mockStatsService.getStats.mockReturnValue(statsPromise);
    mockRateLimitService.readAllRows.mockReturnValue(rowsPromise);

    await request(app.getHttpServer())
      .get("/admin/dashboard")
      .expect(200);

    expect(mockStatsService.getStats).toHaveBeenCalledTimes(1);
    expect(mockRateLimitService.readAllRows).toHaveBeenCalledTimes(1);
  });
});
