import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import request from "supertest";
import Redis from "ioredis";
import { AppModule } from "../src/app.module.js";
import { createTestRedis, isRedisAvailable } from "../src/test/redisTestClient.js";
import { seedUser } from "../src/test/seedUser.js";
import { waitForRedis } from "../src/test/waitForRedis.js";
import { redisKeys } from "../src/lib/redis-keys.js";
import { DEFAULT_LIMIT } from "../src/lib/constants.js";

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("Admin (e2e)", () => {
  let app: NestFastifyApplication;
  let redis: Redis;

  beforeAll(async () => {
    redis = createTestRedis();
    await redis.connect();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    await waitForRedis(app);
  });

  beforeEach(async () => {
    await redis.flushdb();
  });

  afterAll(async () => {
    await app.close();
    await redis.flushdb();
    redis.disconnect();
  });

  describe("GET /admin/users/:id", () => {
    it("200 — returns user row", async () => {
      await seedUser(redis, { userId: "u1", count: 5 });

      const res = await request(app.getHttpServer())
        .get("/admin/users/u1")
        .expect(200);

      expect(res.body.userId).toBe("u1");
      expect(res.body.used).toBe(5);
      expect(res.body.limit).toBe(DEFAULT_LIMIT);
    });

    it("404 — user not found", async () => {
      await request(app.getHttpServer())
        .get("/admin/users/ghost")
        .expect(404);
    });
  });

  describe("GET /admin/users/:id/activity", () => {
    it("200 — hour range returns buckets", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      const res = await request(app.getHttpServer())
        .get("/admin/users/u1/activity?range=hour")
        .expect(200);

      expect(res.body.range).toBe("hour");
      expect(res.body.bucketSize).toBe("1m");
      expect(Array.isArray(res.body.buckets)).toBe(true);
    });

    it("400 — invalid range", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      await request(app.getHttpServer())
        .get("/admin/users/u1/activity?range=week")
        .expect(400);
    });

    it("400 — missing range", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      await request(app.getHttpServer())
        .get("/admin/users/u1/activity")
        .expect(400);
    });
  });

  describe("POST /admin/users/:id/reset", () => {
    it("201 — resets window", async () => {
      await seedUser(redis, { userId: "u1", count: 50 });

      const res = await request(app.getHttpServer())
        .post("/admin/users/u1/reset")
        .expect(201);

      expect(res.body.used).toBe(0);

      const lastReset = await redis.get(redisKeys.userLastReset("u1"));
      expect(lastReset).not.toBeNull();
    });

    it("404 — user not found", async () => {
      await request(app.getHttpServer())
        .post("/admin/users/ghost/reset")
        .expect(404);
    });
  });

  describe("PUT /admin/users/:id/limit", () => {
    it("200 — adjusts limit", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      const res = await request(app.getHttpServer())
        .put("/admin/users/u1/limit")
        .send({ limit: 50 })
        .expect(200);

      expect(res.body.limit).toBe(50);

      const storedLimit = await redis.get(redisKeys.userLimit("u1"));
      expect(storedLimit).toBe("50");
    });

    it("400 — invalid limit", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      await request(app.getHttpServer())
        .put("/admin/users/u1/limit")
        .send({ limit: 0 })
        .expect(400);
    });
  });

  describe("DELETE /admin/users/:id/limit", () => {
    it("200 — resets to default", async () => {
      await seedUser(redis, { userId: "u1", count: 1, limit: 50 });

      const res = await request(app.getHttpServer())
        .delete("/admin/users/u1/limit")
        .expect(200);

      expect(res.body.limit).toBe(DEFAULT_LIMIT);

      const storedLimit = await redis.get(redisKeys.userLimit("u1"));
      expect(storedLimit).toBeNull();
    });
  });

  describe("POST /admin/users/:id/extra", () => {
    it("201 — adds bonus tokens", async () => {
      await seedUser(redis, { userId: "u1", count: 5 });

      const res = await request(app.getHttpServer())
        .post("/admin/users/u1/extra")
        .send({ amount: 10 })
        .expect(201);

      expect(res.body.bonus).toBe(10);

      const bonus = await redis.hget(redisKeys.userRate("u1"), "bonus");
      expect(bonus).toBe("10");
    });

    it("400 — invalid amount", async () => {
      await seedUser(redis, { userId: "u1", count: 5 });

      await request(app.getHttpServer())
        .post("/admin/users/u1/extra")
        .send({ amount: 0 })
        .expect(400);
    });

    it("409 — no active window", async () => {
      await seedUser(redis, { userId: "u1" });

      await request(app.getHttpServer())
        .post("/admin/users/u1/extra")
        .send({ amount: 10 })
        .expect(409);
    });
  });

  describe("POST /admin/users/:id/pause", () => {
    it("201 — pauses user", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      const res = await request(app.getHttpServer())
        .post("/admin/users/u1/pause")
        .send({ seconds: 300 })
        .expect(201);

      expect(res.body.paused).toBe(true);

      const pauseKey = await redis.get(redisKeys.userPaused("u1"));
      expect(pauseKey).toBe("1");

      const ttl = await redis.ttl(redisKeys.userPaused("u1"));
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(300);
    });

    it("400 — duration too short", async () => {
      await seedUser(redis, { userId: "u1", count: 1 });

      await request(app.getHttpServer())
        .post("/admin/users/u1/pause")
        .send({ seconds: 5 })
        .expect(400);
    });
  });

  describe("DELETE /admin/users/:id/pause", () => {
    it("200 — unlocks user", async () => {
      await seedUser(redis, { userId: "u1", count: 1, pauseSeconds: 600 });

      const res = await request(app.getHttpServer())
        .delete("/admin/users/u1/pause")
        .expect(200);

      expect(res.body.paused).toBe(false);

      const pauseKey = await redis.get(redisKeys.userPaused("u1"));
      expect(pauseKey).toBeNull();
    });
  });
});
