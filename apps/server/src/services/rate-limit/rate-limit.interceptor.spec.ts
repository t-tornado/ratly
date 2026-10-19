import { describe, it, expect, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getLoggerToken } from "nestjs-pino";
import { of } from "rxjs";
import { RateLimitInterceptor } from "./rate-limit.interceptor.js";
import { RateLimitService } from "./rate-limit.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { DEFAULT_LIMIT } from "../../lib/constants.js";
import { ConsumeResult, UserRow } from "../../lib/types/index.js";

const silentLogger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

const NOW = Date.now();

function makeConsumeResult(overrides: Partial<ConsumeResult> = {}): ConsumeResult {
  return {
    allowed: true,
    paused: false,
    used: 1,
    allowedTotal: DEFAULT_LIMIT,
    remaining: DEFAULT_LIMIT - 1,
    resetAt: NOW + 3600_000,
    now: NOW,
    ...overrides,
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

function createHttpContext(headers: Record<string, string> = {}) {
  const request = { headers, method: "GET", url: "/test", ip: "127.0.0.1" };
  const responseHeaders: Record<string, string> = {};
  const response = {
    header: vi.fn((name: string, value: string) => { responseHeaders[name] = value; }),
  };

  return {
    context: {
      getType: () => "http" as const,
      getHandler: () => (() => {}),
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    },
    responseHeaders,
  };
}

const callHandler = { handle: () => of("response-body") };

describe("RateLimitInterceptor", () => {
  let interceptor: RateLimitInterceptor;
  let mockService: { isHealthy: boolean; consume: ReturnType<typeof vi.fn>; readRow: ReturnType<typeof vi.fn> };
  let mockGateway: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockService = {
      isHealthy: true,
      consume: vi.fn(),
      readRow: vi.fn(),
    };
    mockGateway = {
      emitRateUpdate: vi.fn(),
      emitLimitExceeded: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitInterceptor,
        Reflector,
        { provide: RateLimitService, useValue: mockService },
        { provide: EventsGateway, useValue: mockGateway },
        { provide: getLoggerToken(RateLimitInterceptor.name), useValue: silentLogger },
      ],
    }).compile();

    interceptor = module.get<RateLimitInterceptor>(RateLimitInterceptor);
  });

  it("throws 503 when Redis is unavailable", async () => {
    mockService.isHealthy = false;
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    try {
      await interceptor.intercept(context as never, callHandler);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }

    expect(mockService.consume).not.toHaveBeenCalled();
  });

  it("throws 401 when x-user-id header is missing", async () => {
    const { context } = createHttpContext({});

    try {
      await interceptor.intercept(context as never, callHandler);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it("allows fresh user and sets x-count header", async () => {
    mockService.consume.mockResolvedValue(makeConsumeResult());
    mockService.readRow.mockResolvedValue(makeUserRow());
    const { context, responseHeaders } = createHttpContext({ "x-user-id": "user-1" });

    await interceptor.intercept(context as never, callHandler);

    expect(responseHeaders["x-count"]).toBe(String(DEFAULT_LIMIT - 1));
  });

  it("emits rateUpdate on allowed request", async () => {
    const row = makeUserRow();
    mockService.consume.mockResolvedValue(makeConsumeResult());
    mockService.readRow.mockResolvedValue(row);
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    await interceptor.intercept(context as never, callHandler);

    expect(mockGateway.emitRateUpdate).toHaveBeenCalledTimes(1);
    expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
  });

  it("throws 429 when consume returns denied", async () => {
    mockService.consume.mockResolvedValue(makeConsumeResult({ allowed: false, used: 100, remaining: 0 }));
    mockService.readRow.mockResolvedValue(makeUserRow({ status: "exceeded" }));
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    try {
      await interceptor.intercept(context as never, callHandler);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it("emits limitExceeded on denied request", async () => {
    const row = makeUserRow({ status: "exceeded" });
    mockService.consume.mockResolvedValue(makeConsumeResult({ allowed: false }));
    mockService.readRow.mockResolvedValue(row);
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    try { await interceptor.intercept(context as never, callHandler); } catch { /* expected */ }

    expect(mockGateway.emitLimitExceeded).toHaveBeenCalledWith(row);
  });

  it("does not emit rateUpdate on denied request", async () => {
    mockService.consume.mockResolvedValue(makeConsumeResult({ allowed: false }));
    mockService.readRow.mockResolvedValue(makeUserRow());
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    try { await interceptor.intercept(context as never, callHandler); } catch { /* expected */ }

    expect(mockGateway.emitRateUpdate).not.toHaveBeenCalled();
  });

  it("passes through non-http context without consuming", async () => {
    const wsContext = { getType: () => "ws" as const };

    const result$ = await interceptor.intercept(wsContext as never, callHandler);

    expect(result$).toBeDefined();
    expect(mockService.consume).not.toHaveBeenCalled();
  });

  it("includes retryAfter in 429 response body", async () => {
    const resetAt = NOW + 1800_000;
    mockService.consume.mockResolvedValue(makeConsumeResult({ allowed: false, resetAt, now: NOW }));
    mockService.readRow.mockResolvedValue(makeUserRow());
    const { context } = createHttpContext({ "x-user-id": "user-1" });

    try {
      await interceptor.intercept(context as never, callHandler);
      expect.unreachable("should have thrown");
    } catch (error) {
      const body = (error as HttpException).getResponse() as Record<string, unknown>;
      expect(body.retryAfter).toBe(1800);
    }
  });
});
