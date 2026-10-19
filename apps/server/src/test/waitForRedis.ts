import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { RedisService } from "../lib/infra/redis/redis.service.js";

const POLL_INTERVAL_MS = 50;
const TIMEOUT_MS = 5000;

export async function waitForRedis(app: NestFastifyApplication): Promise<void> {
  const redis = app.get(RedisService);
  const deadline = Date.now() + TIMEOUT_MS;

  while (redis.status !== "ready") {
    if (Date.now() > deadline) {
      throw new Error("RedisService did not become ready within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
