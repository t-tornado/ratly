import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test } from "@nestjs/testing";
import { NestFastifyApplication, FastifyAdapter } from "@nestjs/platform-fastify";
import { APP_INTERCEPTOR, Reflector } from "@nestjs/core";
import { getLoggerToken } from "nestjs-pino";
import request from "supertest";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "../../services/admin/admin.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { RateLimitInterceptor } from "../../services/rate-limit/rate-limit.interceptor.js";
import { RateLimitService } from "../../services/rate-limit/rate-limit.service.js";
import { UserRow } from "../../lib/types/index.js";
import { DEFAULT_LIMIT } from "../../lib/constants.js";

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

describe("AdminController 503 (interceptor pipeline)", () => {
  let app: NestFastifyApplication;
  let mockAdminService: Record<string, ReturnType<typeof vi.fn>>;
  let mockGateway: Record<string, ReturnType<typeof vi.fn>>;
  let mockRateLimitService: { isHealthy: boolean; consume: ReturnType<typeof vi.fn>; readRow: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAdminService = { getUser: vi.fn() };
    mockGateway = { emitRateUpdate: vi.fn(), emitLimitExceeded: vi.fn() };
    mockRateLimitService = { isHealthy: true, consume: vi.fn(), readRow: vi.fn() };

    const module = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: EventsGateway, useValue: mockGateway },
        { provide: RateLimitService, useValue: mockRateLimitService },
        { provide: APP_INTERCEPTOR, useClass: RateLimitInterceptor },
        { provide: getLoggerToken(RateLimitInterceptor.name), useValue: silentLogger },
        Reflector,
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 503 when Redis is unhealthy", async () => {
    mockRateLimitService.isHealthy = false;

    await request(app.getHttpServer())
      .get("/admin/users/user-1")
      .expect(503);
  });

  it("returns 200 when Redis is healthy (SkipRateLimit bypasses consume)", async () => {
    mockRateLimitService.isHealthy = true;
    mockAdminService.getUser.mockResolvedValue(makeUserRow());

    await request(app.getHttpServer())
      .get("/admin/users/user-1")
      .expect(200);

    expect(mockRateLimitService.consume).not.toHaveBeenCalled();
  });
});
