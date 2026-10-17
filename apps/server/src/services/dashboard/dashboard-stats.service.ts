import { Injectable } from "@nestjs/common";
import { RedisService } from "../../lib/infra/redis/redis.service.js";
import { dashboardStatsScript } from "../rate-limit/scripts/index.js";
import { DashboardStats, TopUser } from "../../lib/types/index.js";
import { DEFAULT_LIMIT, ACTIVE_WINDOW_MS, TOP_USERS_COUNT } from "../../lib/constants.js";

@Injectable()
export class DashboardStatsService {
  constructor(private readonly redis: RedisService) {}

  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().slice(0, 10);

    const raw = (await this.redis.eval(
      dashboardStatsScript,
      2,
      "users:last_seen",
      `stats:429:${today}`,
      String(ACTIVE_WINDOW_MS),
      String(DEFAULT_LIMIT),
      String(TOP_USERS_COUNT),
    )) as (number | string)[];

    const totalUsers = Number(raw[0]);
    const activeUsers = Number(raw[1]);
    const rejectedToday = Number(raw[2]);
    const at = Number(raw[3]);

    const topUsers: TopUser[] = [];
    for (let i = 4; i < raw.length; i += 3) {
      const used = Number(raw[i + 1]);
      const allowedTotal = Number(raw[i + 2]);
      topUsers.push({
        userId: String(raw[i]),
        used,
        allowedTotal,
        ratio: allowedTotal > 0 ? used / allowedTotal : 0,
      });
    }

    return { totalUsers, activeUsers, rejectedToday, topUsers, at };
  }
}
