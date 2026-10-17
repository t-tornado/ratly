import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { EventsModule } from "./events/events.module.js";

import { APP_INTERCEPTOR } from "@nestjs/core";
import { RedisService } from "./lib/infra/redis/redis.service.js";
import { RateLimitService } from "./services/rate-limit/rate-limit.service.js";
import { RateLimitInterceptor } from "./services/rate-limit/rate-limit.interceptor.js";

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [
    RedisService,
    RateLimitService,
    RateLimitInterceptor,
    { provide: APP_INTERCEPTOR, useExisting: RateLimitInterceptor },
  ],
})
export class AppModule {}
