import { FastifyRequest, FastifyReply } from "fastify";

export type RequestType = FastifyRequest;
export type ResponseType = FastifyReply;

export interface RateLimitOutput {
  allowed: boolean;
  resetsIn: string;
  count: number;
}

export enum RateEventType {
  UPDATE = "update",
  LIMIT_EXCEEDED = "limit_exceeded",
}

export interface RateLimitEvent {
  type: RateEventType;
  userId: string;
  allowed: boolean;
  resetsIn: string;
  count: number;
}

export interface RateLimitStrategy {
  consume(userId: string): Promise<RateLimitOutput>;
}
