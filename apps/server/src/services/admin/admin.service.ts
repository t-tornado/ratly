import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { RateLimitService } from "../rate-limit/rate-limit.service.js";
import { addExtraScript, resetWindowScript } from "../rate-limit/scripts/index.js";
import { UserRow } from "../../lib/types/index.js";
import { redisKeys } from "../../lib/redis-keys.js";

@Injectable()
export class AdminService {
  constructor(
    private readonly redis: RedisService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async resetWindow(userId: string): Promise<UserRow> {
    await this.assertUserExists(userId);
    await this.redis.eval(
      resetWindowScript,
      2,
      redisKeys.userRate(userId),
      redisKeys.userLastReset(userId),
      String(Date.now()),
    );
    return (await this.rateLimitService.readRow(userId))!;
  }

  async adjustLimit(userId: string, limit: number): Promise<UserRow> {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException("limit must be a whole number >= 1");
    }
    await this.assertUserExists(userId);
    await this.redis.set(redisKeys.userLimit(userId), String(limit));
    return (await this.rateLimitService.readRow(userId))!;
  }

  async resetLimitToDefault(userId: string): Promise<UserRow> {
    await this.assertUserExists(userId);
    await this.redis.del(redisKeys.userLimit(userId));
    return (await this.rateLimitService.readRow(userId))!;
  }

  async addExtra(userId: string, amount: number): Promise<UserRow> {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new BadRequestException("amount must be a whole number >= 1");
    }
    await this.assertUserExists(userId);

    const result = (await this.redis.eval(
      addExtraScript,
      1,
      redisKeys.userRate(userId),
      String(amount),
    )) as number;

    if (result === -1) {
      throw new ConflictException("User has no active window; their limit is already fully available.");
    }

    return (await this.rateLimitService.readRow(userId))!;
  }

  async pause(userId: string, seconds: number): Promise<UserRow> {
    if (!Number.isInteger(seconds) || seconds < 60 || seconds > 86400) {
      throw new BadRequestException("seconds must be a whole number between 60 and 86400");
    }
    await this.assertUserExists(userId);
    await this.redis.set(redisKeys.userPaused(userId), "1", "EX", seconds);
    return (await this.rateLimitService.readRow(userId))!;
  }

  async unlock(userId: string): Promise<UserRow> {
    await this.assertUserExists(userId);
    await this.redis.del(redisKeys.userPaused(userId));
    return (await this.rateLimitService.readRow(userId))!;
  }

  private async assertUserExists(userId: string): Promise<void> {
    const exists = await this.rateLimitService.userExists(userId);
    if (!exists) throw new NotFoundException(`User ${userId} not found`);
  }
}
