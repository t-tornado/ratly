import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import request from "supertest";
import { AppModule } from "../src/app.module.js";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it("/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe("ratly server is running");
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
