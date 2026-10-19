import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import request from "supertest";
import Redis from "ioredis";
import { AppModule } from "../src/app.module.js";
import { createTestRedis, isRedisAvailable } from "../src/test/redisTestClient.js";
import { waitForRedis } from "../src/test/waitForRedis.js";

const redisAvailable = await isRedisAvailable();

describe.runIf(redisAvailable)("App (e2e)", () => {
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

  it("GET /health → 200", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);

    expect(res.body.message).toBe("ratly server is running");
  });

  it("GET /test → 200", async () => {
    const res = await request(app.getHttpServer()).get("/test").expect(200);

    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("ratly");
    expect(res.body.timestamp).toBeDefined();
  });
});
