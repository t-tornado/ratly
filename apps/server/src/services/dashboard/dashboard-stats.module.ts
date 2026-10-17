import { Module } from "@nestjs/common";
import { DashboardStatsService } from "./dashboard-stats.service.js";

@Module({
  providers: [DashboardStatsService],
  exports: [DashboardStatsService],
})
export class DashboardStatsModule {}
