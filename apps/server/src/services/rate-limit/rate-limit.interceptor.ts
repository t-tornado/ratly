import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Observable } from "rxjs";

import { RateLimitService } from "./rate-limit.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { RequestType, ResponseType } from "../../lib/types/index.js";
import { SKIP_RATE_LIMIT } from "./skip-rate-limit.decorator.js";
import { NEAR_LIMIT_THRESHOLD } from "../../lib/constants.js";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly eventsGateway: EventsGateway,
    private readonly reflector: Reflector,
    @InjectPinoLogger(RateLimitInterceptor.name) private readonly logger: PinoLogger,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    /**
     * Rate limiting depends on Redis — checked via {@link RateLimitService.isHealthy}
     * rather than Redis directly because this interceptor owns the rate-limit concern.
     *
     * @see EventsGateway.isRedisReady for the WebSocket equivalent
     */
    if (!this.rateLimitService.isHealthy) {
      this.logger.error("RateLimit:Redis [Unavailable]");
      throw new HttpException(
        { statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: "Service temporarily unavailable" },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const shouldSkip = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (shouldSkip) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestType>();
    const response = context.switchToHttp().getResponse<ResponseType>();
    const method = request.method;
    const url = request.url;

    const userId = request.headers["x-user-id"] as string;
    if (!userId) {
      this.logger.warn(
        { method, url, ip: request.ip },
        "RateLimit:Consume [Unauthorized]",
      );
      throw new HttpException("Missing x-user-id header", HttpStatus.UNAUTHORIZED);
    }

    const startTime = Date.now();

    try {
      const consumeResult = await this.rateLimitService.consume(userId);

      if (!consumeResult.allowed) {
        const row = await this.rateLimitService.readRow(userId);
        const durationMs = Date.now() - startTime;

        if (row) {
          this.eventsGateway.emitLimitExceeded(row);
        }

        const retryAfter = consumeResult.resetAt
          ? Math.ceil((consumeResult.resetAt - consumeResult.now) / 1000)
          : null;

        this.logger.info(
          {
            userId,
            method,
            url,
            used: consumeResult.used,
            allowedTotal: consumeResult.allowedTotal,
            retryAfter,
            paused: consumeResult.paused,
            durationMs,
          },
          "RateLimit:Consume [Denied]",
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: "Rate limit exceeded",
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      response.header("x-count", String(consumeResult.remaining));

      const row = await this.rateLimitService.readRow(userId);
      const durationMs = Date.now() - startTime;

      if (row) {
        this.eventsGateway.emitRateUpdate(row);
      }

      const usageRatio = consumeResult.allowedTotal > 0
        ? consumeResult.used / consumeResult.allowedTotal
        : 0;

      const logContext = {
        userId,
        method,
        url,
        used: consumeResult.used,
        remaining: consumeResult.remaining,
        allowedTotal: consumeResult.allowedTotal,
        resetAt: consumeResult.resetAt,
        durationMs,
      };

      if (usageRatio >= NEAR_LIMIT_THRESHOLD) {
        this.logger.info(logContext, "RateLimit:Consume [NearLimit]");
      } else {
        this.logger.debug(logContext, "RateLimit:Consume [Allowed]");
      }

      return next.handle();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const durationMs = Date.now() - startTime;
      this.logger.error(
        {
          userId,
          method,
          url,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
        },
        "RateLimit:Consume [Failed]",
      );
      throw error;
    }
  }
}
