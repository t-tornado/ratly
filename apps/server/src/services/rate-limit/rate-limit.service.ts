import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { consumeFixedWindowScript } from "./scripts/index.js";
import { RateLimitOutput } from "../../lib/types/index.js";

type LuaScriptResult = [allowed: number, count: number, ttl: number];

const MAX_REQUESTS = 100;
const WINDOW_SECONDS = 3600;

@Injectable()
export class RateLimitService {
  constructor(private readonly redisClient: RedisService) {}

  async consume(userId: string): Promise<RateLimitOutput> {
    const rateLimitKey = `rate_limit:${userId}`;

    const result = (await this.redisClient.eval(
      consumeFixedWindowScript,
      1,
      rateLimitKey,
      MAX_REQUESTS,
      WINDOW_SECONDS,
    )) as LuaScriptResult;

    const [allowed, count, ttl] = result;

    return {
      allowed: allowed === 1,
      count,
      resetsIn: `${ttl}s`,
    };
  }
}
