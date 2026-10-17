import { Controller, Get } from "@nestjs/common";
import { DashboardStatsService } from "../../services/dashboard/dashboard-stats.service.js";
import { RateLimitService } from "../../services/rate-limit/rate-limit.service.js";
import { SkipRateLimit } from "../../services/rate-limit/skip-rate-limit.decorator.js";

@Controller("admin")
@SkipRateLimit()
export class DashboardController {
  constructor(
    private readonly dashboardStatsService: DashboardStatsService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Get("dashboard")
  async getDashboard() {
    const [stats, rows] = await Promise.all([
      this.dashboardStatsService.getStats(),
      this.rateLimitService.readAllRows(),
    ]);
    return { stats, rows };
  }
}
