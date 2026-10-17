import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway.js";
import { DashboardStatsModule } from "../services/dashboard/dashboard-stats.module.js";

@Module({
  imports: [DashboardStatsModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
