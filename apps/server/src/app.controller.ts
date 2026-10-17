import { Controller, Get, MiddlewareConsumer } from "@nestjs/common";

@Controller()
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
