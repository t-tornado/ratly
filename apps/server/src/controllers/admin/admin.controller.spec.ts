import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test } from "@nestjs/testing";
import { NestFastifyApplication, FastifyAdapter } from "@nestjs/platform-fastify";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import request from "supertest";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "../../services/admin/admin.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { UserRow, ActivityResponse } from "../../lib/types/index.js";
import { DEFAULT_LIMIT } from "../../lib/constants.js";

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

function makeActivityResponse(): ActivityResponse {
  return { range: "hour", bucketSize: "1m", buckets: [{ time: "14:00", allowed: 3, rejected: 1 }] };
}

describe("AdminController (HTTP)", () => {
  let app: NestFastifyApplication;
  let mockAdminService: Record<string, ReturnType<typeof vi.fn>>;
  let mockGateway: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockAdminService = {
      getUser: vi.fn(),
      getActivity: vi.fn(),
      resetWindow: vi.fn(),
      adjustLimit: vi.fn(),
      resetLimitToDefault: vi.fn(),
      addExtra: vi.fn(),
      pause: vi.fn(),
      unlock: vi.fn(),
    };
    mockGateway = { emitRateUpdate: vi.fn() };

    const module = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: EventsGateway, useValue: mockGateway },
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /admin/users/:id", () => {
    it("returns 200 with user row", async () => {
      const row = makeUserRow();
      mockAdminService.getUser.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .get("/admin/users/user-1")
        .expect(200);

      expect(res.body.userId).toBe("user-1");
      expect(mockAdminService.getUser).toHaveBeenCalledWith("user-1");
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.getUser.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .get("/admin/users/ghost")
        .expect(404);
    });
  });

  describe("GET /admin/users/:id/activity", () => {
    it("returns 200 with activity data", async () => {
      const activity = makeActivityResponse();
      mockAdminService.getActivity.mockResolvedValue(activity);

      const res = await request(app.getHttpServer())
        .get("/admin/users/user-1/activity?range=hour")
        .expect(200);

      expect(res.body.range).toBe("hour");
      expect(mockAdminService.getActivity).toHaveBeenCalledWith("user-1", "hour");
    });

    it("returns 400 on invalid range", async () => {
      mockAdminService.getActivity.mockRejectedValue(new BadRequestException("range must be one of: hour, day"));

      await request(app.getHttpServer())
        .get("/admin/users/user-1/activity?range=week")
        .expect(400);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.getActivity.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .get("/admin/users/ghost/activity?range=hour")
        .expect(404);
    });
  });

  describe("POST /admin/users/:id/reset", () => {
    it("returns 201 with row and emits rateUpdate", async () => {
      const row = makeUserRow();
      mockAdminService.resetWindow.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .post("/admin/users/user-1/reset")
        .expect(201);

      expect(res.body.userId).toBe("user-1");
      expect(mockAdminService.resetWindow).toHaveBeenCalledWith("user-1");
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 404 and does not emit when user not found", async () => {
      mockAdminService.resetWindow.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .post("/admin/users/ghost/reset")
        .expect(404);

      expect(mockGateway.emitRateUpdate).not.toHaveBeenCalled();
    });
  });

  describe("PUT /admin/users/:id/limit", () => {
    it("returns 200 with row and emits rateUpdate", async () => {
      const row = makeUserRow({ limit: 50 });
      mockAdminService.adjustLimit.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .put("/admin/users/user-1/limit")
        .send({ limit: 50 })
        .expect(200);

      expect(res.body.limit).toBe(50);
      expect(mockAdminService.adjustLimit).toHaveBeenCalledWith("user-1", 50);
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 400 on invalid limit", async () => {
      mockAdminService.adjustLimit.mockRejectedValue(new BadRequestException("limit must be a whole number >= 1"));

      await request(app.getHttpServer())
        .put("/admin/users/user-1/limit")
        .send({ limit: 0 })
        .expect(400);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.adjustLimit.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .put("/admin/users/ghost/limit")
        .send({ limit: 50 })
        .expect(404);
    });
  });

  describe("DELETE /admin/users/:id/limit", () => {
    it("returns 200 with row and emits rateUpdate", async () => {
      const row = makeUserRow();
      mockAdminService.resetLimitToDefault.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .delete("/admin/users/user-1/limit")
        .expect(200);

      expect(res.body.userId).toBe("user-1");
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.resetLimitToDefault.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .delete("/admin/users/ghost/limit")
        .expect(404);
    });
  });

  describe("POST /admin/users/:id/extra", () => {
    it("returns 201 with row and emits rateUpdate", async () => {
      const row = makeUserRow({ bonus: 10 });
      mockAdminService.addExtra.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .post("/admin/users/user-1/extra")
        .send({ amount: 10 })
        .expect(201);

      expect(res.body.bonus).toBe(10);
      expect(mockAdminService.addExtra).toHaveBeenCalledWith("user-1", 10);
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 400 on invalid amount", async () => {
      mockAdminService.addExtra.mockRejectedValue(new BadRequestException("amount must be a whole number >= 1"));

      await request(app.getHttpServer())
        .post("/admin/users/user-1/extra")
        .send({ amount: 0 })
        .expect(400);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.addExtra.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .post("/admin/users/ghost/extra")
        .send({ amount: 10 })
        .expect(404);
    });

    it("returns 409 when no active window", async () => {
      mockAdminService.addExtra.mockRejectedValue(new ConflictException("User has no active window"));

      await request(app.getHttpServer())
        .post("/admin/users/user-1/extra")
        .send({ amount: 10 })
        .expect(409);
    });
  });

  describe("POST /admin/users/:id/pause", () => {
    it("returns 201 with row and emits rateUpdate", async () => {
      const row = makeUserRow({ paused: true });
      mockAdminService.pause.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .post("/admin/users/user-1/pause")
        .send({ seconds: 300 })
        .expect(201);

      expect(res.body.paused).toBe(true);
      expect(mockAdminService.pause).toHaveBeenCalledWith("user-1", 300);
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 400 on invalid seconds", async () => {
      mockAdminService.pause.mockRejectedValue(new BadRequestException("seconds must be a whole number"));

      await request(app.getHttpServer())
        .post("/admin/users/user-1/pause")
        .send({ seconds: 5 })
        .expect(400);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.pause.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .post("/admin/users/ghost/pause")
        .send({ seconds: 300 })
        .expect(404);
    });
  });

  describe("DELETE /admin/users/:id/pause", () => {
    it("returns 200 with row and emits rateUpdate", async () => {
      const row = makeUserRow({ paused: false });
      mockAdminService.unlock.mockResolvedValue(row);

      const res = await request(app.getHttpServer())
        .delete("/admin/users/user-1/pause")
        .expect(200);

      expect(res.body.paused).toBe(false);
      expect(mockGateway.emitRateUpdate).toHaveBeenCalledWith(row);
    });

    it("returns 404 when user not found", async () => {
      mockAdminService.unlock.mockRejectedValue(new NotFoundException("User ghost not found"));

      await request(app.getHttpServer())
        .delete("/admin/users/ghost/pause")
        .expect(404);
    });
  });

  describe("event emission on reads vs mutations", () => {
    it("does not emit rateUpdate on GET requests", async () => {
      mockAdminService.getUser.mockResolvedValue(makeUserRow());
      mockAdminService.getActivity.mockResolvedValue(makeActivityResponse());

      await request(app.getHttpServer()).get("/admin/users/user-1").expect(200);
      await request(app.getHttpServer()).get("/admin/users/user-1/activity?range=hour").expect(200);

      expect(mockGateway.emitRateUpdate).not.toHaveBeenCalled();
    });
  });
});
