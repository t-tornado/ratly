import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import Redis from "ioredis";

import { REDIS_RETRY_BASE_MS, REDIS_RETRY_CAP_MS } from "../../constants.js";

/**
 * Linear backoff for Redis reconnection attempts, capped at {@link REDIS_RETRY_CAP_MS}.
 *
 * Never returns null — ioredis retries indefinitely so the server
 * stays alive while Redis is down.
 */
const computeReconnectDelay = (attemptNumber: number): number =>
  Math.min(attemptNumber * REDIS_RETRY_BASE_MS, REDIS_RETRY_CAP_MS);

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly redisHost: string;
  private readonly redisPort: number;

  constructor(
    configService: ConfigService,
    @InjectPinoLogger(RedisService.name) private readonly logger: PinoLogger,
  ) {
    const host = configService.get<string>("REDIS_HOST", "localhost");
    const port = configService.get<number>("REDIS_PORT", 6379);
    super({
      host,
      port,
      maxRetriesPerRequest: null,
      retryStrategy: computeReconnectDelay,
    });

    this.redisHost = host;
    this.redisPort = port;

    this.on("connect", () => {
      this.logger.info(
        { host: this.redisHost, port: this.redisPort },
        "Redis:Connect [Success]",
      );
    });

    this.on("error", (error: Error) => {
      this.logger.error(
        { host: this.redisHost, port: this.redisPort, error: error.message },
        "Redis:Connect [Failed]",
      );
    });

    this.on("reconnecting", () => {
      this.logger.warn(
        { host: this.redisHost, port: this.redisPort },
        "Redis:Reconnect [Start]",
      );
    });
  }

  onModuleDestroy() {
    this.logger.info({ reason: "shutdown" }, "Redis:Disconnect [Success]");
    this.quit();
  }
}
