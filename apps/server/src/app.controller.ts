import { Controller, Get } from "@nestjs/common";
import { SkipRateLimit } from "./services/rate-limit/skip-rate-limit.decorator.js";

@Controller()
@SkipRateLimit()
export class AppController {
  @Get("health")
  hello() {
    return { message: "ratly server is running" };
  }

  @Get("test")
  test() {
    return {
      status: "ok",
      service: "ratly",
      timestamp: new Date().toISOString(),
    };
  }
}
