import { Controller, Get } from "@nestjs/common";

const version = "1";
@Controller({ version })
export class AppController {
  @Get("health")
  hello() {
    return { message: "ratly server is running", version };
  }
}
