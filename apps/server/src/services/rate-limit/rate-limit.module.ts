import { Global, Module } from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service.js";
import { RateLimitInterceptor } from "./rate-limit.interceptor.js";
import { EventsModule } from "../../events/events.module.js";

@Global()
@Module({
  imports: [EventsModule],
  providers: [RateLimitService, RateLimitInterceptor],
  exports: [RateLimitService, RateLimitInterceptor],
})
export class RateLimitModule {}
