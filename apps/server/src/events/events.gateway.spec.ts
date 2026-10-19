import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { getLoggerToken } from "nestjs-pino";
import Redis from "ioredis-mock";
import { EventsGateway } from "./events.gateway.js";
import { DashboardStatsService } from "../services/dashboard/dashboard-stats.service.js";
import { RedisService } from "../lib/infra/redis/redis.service.js";
import { UserRow, DashboardStats } from "../lib/types/index.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import {
  RATE_UPDATE_EVENT,
  RATE_LIMIT_EXCEEDED_EVENT,
  DASHBOARD_STATS_UPDATE_EVENT,
} from "@ratly/core";

const silentLogger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

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

function makeStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    totalUsers: 10,
    activeUsers: 5,
    rejectedToday: 2,
    nearLimitPercent: 10,
    topUsers: [],
    at: NOW,
    ...overrides,
  };
}

describe("EventsGateway", () => {
  let gateway: EventsGateway;
  let redis: InstanceType<typeof Redis>;
  let mockServer: { emit: ReturnType<typeof vi.fn>; engine: { clientsCount: number } };
  let mockStatsService: { getStats: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    redis = new Redis();

    mockStatsService = { getStats: vi.fn() };
    mockServer = {
      emit: vi.fn(),
      engine: { clientsCount: 0 },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        ConfigService,
        { provide: DashboardStatsService, useValue: mockStatsService },
        { provide: RedisService, useValue: redis },
        { provide: getLoggerToken(EventsGateway.name), useValue: silentLogger },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer as never;
  });

  afterEach(() => {
    gateway.onModuleDestroy();
    redis.disconnect();
  });

  describe("emitRateUpdate", () => {
    it("emits correct event and payload", () => {
      const row = makeUserRow();

      gateway.emitRateUpdate(row);

      expect(mockServer.emit).toHaveBeenCalledWith(
        RATE_UPDATE_EVENT,
        { type: RATE_UPDATE_EVENT, row },
      );
    });
  });

  describe("emitLimitExceeded", () => {
    it("emits correct event and payload", () => {
      const row = makeUserRow({ status: "exceeded" });

      gateway.emitLimitExceeded(row);

      expect(mockServer.emit).toHaveBeenCalledWith(
        RATE_LIMIT_EXCEEDED_EVENT,
        { type: RATE_LIMIT_EXCEEDED_EVENT, row },
      );
    });
  });

  describe("emitDashboardStats", () => {
    it("emits correct event and payload", () => {
      const stats = makeStats();

      gateway.emitDashboardStats(stats);

      expect(mockServer.emit).toHaveBeenCalledWith(
        DASHBOARD_STATS_UPDATE_EVENT,
        { type: DASHBOARD_STATS_UPDATE_EVENT, stats },
      );
    });
  });

  describe("handleConnection", () => {
    it("disconnects client when Redis is not ready", () => {
      const mockClient = { id: "client-1", disconnect: vi.fn() };
      Object.defineProperty(redis, "status", { value: "connecting", writable: true });

      gateway.handleConnection(mockClient as never);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
    });

    it("allows client when Redis is ready", () => {
      const mockClient = { id: "client-1", disconnect: vi.fn() };
      Object.defineProperty(redis, "status", { value: "ready", writable: true });

      gateway.handleConnection(mockClient as never);

      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("onModuleInit starts stats interval", () => {
      vi.useFakeTimers();

      gateway.onModuleInit();

      expect(gateway["statsTimer"]).not.toBeNull();

      vi.useRealTimers();
    });

    it("onModuleDestroy clears stats interval", () => {
      vi.useFakeTimers();

      gateway.onModuleInit();
      gateway.onModuleDestroy();

      expect(gateway["statsTimer"]).toBeNull();

      vi.useRealTimers();
    });

    it("stats interval skips emit when Redis is not ready", async () => {
      vi.useFakeTimers();
      Object.defineProperty(redis, "status", { value: "connecting", writable: true });

      gateway.onModuleInit();
      await vi.advanceTimersByTimeAsync(10_000);

      expect(mockStatsService.getStats).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
