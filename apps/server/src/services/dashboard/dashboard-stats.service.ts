import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { dashboardStatsScript } from "../rate-limit/scripts/index.js";
import { DashboardStats, TopUser } from "../../lib/types/index.js";
import { DEFAULT_LIMIT, ACTIVE_WINDOW_MS, TOP_USERS_COUNT, NEAR_LIMIT_THRESHOLD } from "../../lib/constants.js";
import { redisKeys } from "../../lib/redis-keys.js";

@Injectable()
export class DashboardStatsService {
  constructor(private readonly redis: RedisService) {}

  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().slice(0, 10);

    const raw = (await this.redis.eval(
      dashboardStatsScript,
      2,
      redisKeys.usersLastSeen,
      redisKeys.stats429(today),
      String(ACTIVE_WINDOW_MS),
      String(DEFAULT_LIMIT),
      String(TOP_USERS_COUNT),
      String(NEAR_LIMIT_THRESHOLD),
    )) as (number | string)[];

    const totalUsers = Number(raw[0]);
    const activeUsers = Number(raw[1]);
    const rejectedToday = Number(raw[2]);
    const at = Number(raw[3]);
    const nearLimitPercent = Number(raw[4]);

    const topUsers: TopUser[] = [];
    for (let i = 5; i < raw.length; i += 3) {
      topUsers.push({
        userId: String(raw[i]),
        used: Number(raw[i + 1]),
        allowedTotal: Number(raw[i + 2]),
      });
    }

    return { totalUsers, activeUsers, rejectedToday, nearLimitPercent, topUsers, at };
  }
}
