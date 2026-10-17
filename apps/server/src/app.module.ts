import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller.js";
import { RedisModule } from "./lib/infra/redis/redis.module.js";
import { RateLimitModule } from "./services/rate-limit/rate-limit.module.js";
import { RateLimitInterceptor } from "./services/rate-limit/rate-limit.interceptor.js";
import { EventsModule } from "./events/events.module.js";
import { AdminModule } from "./services/admin/admin.module.js";
import { DashboardStatsModule } from "./services/dashboard/dashboard-stats.module.js";

@Module({
  imports: [
    RedisModule,
    RateLimitModule,
    EventsModule,
    AdminModule,
    DashboardStatsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useExisting: RateLimitInterceptor },
  ],
})
export class AppModule {}
