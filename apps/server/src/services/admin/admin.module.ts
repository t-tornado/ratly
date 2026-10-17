import { Module } from "@nestjs/common";
import { AdminController } from "../../controllers/admin/admin.controller.js";
import { DashboardController } from "../../controllers/admin/dashboard.controller.js";
import { AdminService } from "./admin.service.js";
import { EventsModule } from "../../events/events.module.js";
import { DashboardStatsModule } from "../dashboard/dashboard-stats.module.js";

@Module({
  imports: [EventsModule, DashboardStatsModule],
  controllers: [AdminController, DashboardController],
  providers: [AdminService],
})
export class AdminModule {}
