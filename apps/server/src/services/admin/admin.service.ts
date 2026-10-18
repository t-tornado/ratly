import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { RateLimitService } from "../rate-limit/rate-limit.service.js";
import { addExtraScript, resetWindowScript } from "../rate-limit/scripts/index.js";
import { UserRow, ActivityBucket, ActivityRange, ActivityResponse } from "../../lib/types/index.js";
import { redisKeys } from "../../lib/redis-keys.js";

const VALID_ACTIVITY_RANGES: ActivityRange[] = ["hour", "day"];
const MINUTES_PER_DAY_BUCKET = 30;

@Injectable()
export class AdminService {
  constructor(
    private readonly redis: RedisService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async getUser(userId: string): Promise<UserRow> {
    const row = await this.rateLimitService.readRow(userId);
    if (!row) throw new NotFoundException(`User ${userId} not found`);
    return row;
  }

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

  async getActivity(userId: string, range: string | undefined): Promise<ActivityResponse> {
    if (!range || !VALID_ACTIVITY_RANGES.includes(range as ActivityRange)) {
      throw new BadRequestException("range must be one of: hour, day");
    }
    await this.assertUserExists(userId);

    const now = new Date();
    const todayKey = redisKeys.activityBucket(userId, this.formatDate(now));

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = redisKeys.activityBucket(userId, this.formatDate(yesterdayDate));

    const [todayFields, yesterdayFields] = await Promise.all([
      this.redis.hgetall(todayKey),
      this.redis.hgetall(yesterdayKey),
    ]);

    const minuteCounts = new Map<string, { allowed: number; rejected: number }>();

    this.parseActivityFields(yesterdayFields, yesterdayDate, minuteCounts);
    this.parseActivityFields(todayFields, now, minuteCounts);

    if (range === "hour") {
      return this.buildHourResponse(now, minuteCounts);
    }
    return this.buildDayResponse(now, minuteCounts);
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private parseActivityFields(
    fields: Record<string, string>,
    date: Date,
    target: Map<string, { allowed: number; rejected: number }>,
  ): void {
    const datePrefix = this.formatDate(date);
    for (const [field, value] of Object.entries(fields)) {
      const parts = field.split(":");
      if (parts.length !== 3) continue;
      const time = `${parts[0]}:${parts[1]}`;
      const outcome = parts[2];
      if (outcome !== "allowed" && outcome !== "rejected") continue;

      const absoluteKey = `${datePrefix}T${time}`;
      const existing = target.get(absoluteKey) ?? { allowed: 0, rejected: 0 };
      existing[outcome] += parseInt(value, 10);
      target.set(absoluteKey, existing);
    }
  }

  private buildHourResponse(
    now: Date,
    minuteCounts: Map<string, { allowed: number; rejected: number }>,
  ): ActivityResponse {
    const buckets: ActivityBucket[] = [];
    for (let minutesAgo = 59; minutesAgo >= 0; minutesAgo--) {
      const bucketTime = new Date(now.getTime() - minutesAgo * 60_000);
      const datePrefix = this.formatDate(bucketTime);
      const hours = String(bucketTime.getUTCHours()).padStart(2, "0");
      const minutes = String(bucketTime.getUTCMinutes()).padStart(2, "0");
      const absoluteKey = `${datePrefix}T${hours}:${minutes}`;
      const counts = minuteCounts.get(absoluteKey) ?? { allowed: 0, rejected: 0 };
      buckets.push({ time: `${hours}:${minutes}`, ...counts });
    }
    return { range: "hour", bucketSize: "1m", buckets };
  }

  private buildDayResponse(
    now: Date,
    minuteCounts: Map<string, { allowed: number; rejected: number }>,
  ): ActivityResponse {
    const buckets: ActivityBucket[] = [];
    const totalBuckets = 48;
    const bucketDurationMs = MINUTES_PER_DAY_BUCKET * 60_000;

    for (let bucketIndex = totalBuckets - 1; bucketIndex >= 0; bucketIndex--) {
      const bucketStartMs = now.getTime() - bucketIndex * bucketDurationMs;
      let allowed = 0;
      let rejected = 0;

      for (let minuteOffset = 0; minuteOffset < MINUTES_PER_DAY_BUCKET; minuteOffset++) {
        const minuteTime = new Date(bucketStartMs + minuteOffset * 60_000);
        const datePrefix = this.formatDate(minuteTime);
        const hours = String(minuteTime.getUTCHours()).padStart(2, "0");
        const minutes = String(minuteTime.getUTCMinutes()).padStart(2, "0");
        const absoluteKey = `${datePrefix}T${hours}:${minutes}`;
        const counts = minuteCounts.get(absoluteKey);
        if (counts) {
          allowed += counts.allowed;
          rejected += counts.rejected;
        }
      }

      const bucketStart = new Date(bucketStartMs);
      const hours = String(bucketStart.getUTCHours()).padStart(2, "0");
      const minutes = String(bucketStart.getUTCMinutes()).padStart(2, "0");
      buckets.push({ time: `${hours}:${minutes}`, allowed, rejected });
    }

    return { range: "day", bucketSize: "30m", buckets };
  }

  private async assertUserExists(userId: string): Promise<void> {
    const exists = await this.rateLimitService.userExists(userId);
    if (!exists) throw new NotFoundException(`User ${userId} not found`);
  }
}
