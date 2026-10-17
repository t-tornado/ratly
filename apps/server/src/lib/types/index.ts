import { FastifyRequest, FastifyReply } from "fastify";

export type RequestType = FastifyRequest;
export type ResponseType = FastifyReply;

export interface ConsumeResult {
  allowed: boolean;
  paused: boolean;
  used: number;
  allowedTotal: number;
  remaining: number;
  resetAt: number | null;
  now: number;
}

// Shared types — sourced from core, re-exported for server-internal use
export type { UserRow, TopUser, DashboardStats, RateUpdateEvent, RateLimitExceededEvent, DashboardStatsEvent, ServerEvent } from "@ratly/core";
