import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test } from "@nestjs/testing";
import { NestFastifyApplication, FastifyAdapter } from "@nestjs/platform-fastify";
import request from "supertest";
import { AppController } from "./app.controller.js";

describe("AppController (HTTP)", () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /health returns 200 with message", async () => {
    const res = await request(app.getHttpServer())
      .get("/health")
      .expect(200);

    expect(res.body).toEqual({ message: "ratly server is running" });
  });

  it("GET /test returns 200 with status, service, and timestamp", async () => {
    const res = await request(app.getHttpServer())
      .get("/test")
      .expect(200);

    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("ratly");
    expect(res.body.timestamp).toBeDefined();
  });
});
