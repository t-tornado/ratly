import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import request from "supertest";
import Redis from "ioredis";
import { AppModule } from "../src/app.module.js";
import { createTestRedis, isRedisAvailable } from "../src/test/redisTestClient.js";
import { seedUser } from "../src/test/seedUser.js";
import { waitForRedis } from "../src/test/waitForRedis.js";

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("Dashboard (e2e)", () => {
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

  it("empty dashboard — no users", async () => {
    const res = await request(app.getHttpServer())
      .get("/admin/dashboard")
      .expect(200);

    expect(res.body.stats.totalUsers).toBe(0);
    expect(res.body.rows).toEqual([]);
  });

  it("dashboard with seeded users", async () => {
    await seedUser(redis, { userId: "u1", count: 10 });
    await seedUser(redis, { userId: "u2", count: 20 });
    await seedUser(redis, { userId: "u3", count: 30 });

    const res = await request(app.getHttpServer())
      .get("/admin/dashboard")
      .expect(200);

    expect(res.body.stats.totalUsers).toBe(3);
    expect(res.body.rows).toHaveLength(3);
  });

  it("stats shape is correct", async () => {
    await seedUser(redis, { userId: "u1", count: 5 });
    await seedUser(redis, { userId: "u2", count: 15 });

    const res = await request(app.getHttpServer())
      .get("/admin/dashboard")
      .expect(200);

    const { stats } = res.body;
    expect(stats).toHaveProperty("totalUsers");
    expect(stats).toHaveProperty("activeUsers");
    expect(stats).toHaveProperty("rejectedToday");
    expect(stats).toHaveProperty("nearLimitPercent");
    expect(stats).toHaveProperty("topUsers");
    expect(stats).toHaveProperty("at");
  });
});
