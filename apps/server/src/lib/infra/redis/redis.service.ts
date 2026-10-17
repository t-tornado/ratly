import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({ host: "localhost", port: 6379 });
  }

  onModuleDestroy() {
    this.quit();
  }
}
