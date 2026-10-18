import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { RateLimitService } from "./rate-limit.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { RequestType, ResponseType } from "../../lib/types/index.js";
import { SKIP_RATE_LIMIT } from "./skip-rate-limit.decorator.js";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly eventsGateway: EventsGateway,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (context.getType() !== "http") {
      return next.handle();
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

    const userId = request.headers["x-user-id"] as string;
    if (!userId) {
      throw new HttpException("Missing x-user-id header", HttpStatus.UNAUTHORIZED);
    }

    const consumeResult = await this.rateLimitService.consume(userId);

    if (!consumeResult.allowed) {
      const row = await this.rateLimitService.readRow(userId);
      if (row) {
        this.eventsGateway.emitLimitExceeded(row);
      }

      const retryAfter = consumeResult.resetAt
        ? Math.ceil((consumeResult.resetAt - consumeResult.now) / 1000)
        : null;

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
    if (row) {
      this.eventsGateway.emitRateUpdate(row);
    }

    return next.handle();
  }
}
