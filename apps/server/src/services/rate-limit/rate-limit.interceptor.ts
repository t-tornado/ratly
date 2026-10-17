import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

import { RateLimitService } from "./rate-limit.service.js";
import { EventsGateway } from "../../events/events.gateway.js";
import { RateEventType, RequestType, ResponseType } from "../../lib/types/index.js";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestType>();
    const response = context.switchToHttp().getResponse<ResponseType>();

    const userId = request.headers["x-user-id"] as string;
    if (!userId) {
      throw new HttpException(
        "Missing x-user-id header",
        HttpStatus.BAD_REQUEST,
      );
    }

    const { allowed, count, resetsIn } =
      await this.rateLimitService.consume(userId);

    const eventType = allowed ? RateEventType.UPDATE : RateEventType.LIMIT_EXCEEDED;
    console.log("[Interceptor] emitting rate:event, gateway exists:", !!this.eventsGateway);
    this.eventsGateway.emitRateEvent({ type: eventType, userId, allowed, count, resetsIn });

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: "Rate limit exceeded",
          retryAfter: resetsIn,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const remaining = 100 - count;
    response.header("x-count", String(remaining));

    return next.handle();
  }
}
