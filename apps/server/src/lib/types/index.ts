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

export interface ActivityBucket {
  time: string;
  allowed: number;
  rejected: number;
}

export type ActivityRange = "hour" | "day";

export interface ActivityResponse {
  range: ActivityRange;
  bucketSize: string;
  buckets: ActivityBucket[];
}

// Shared types — sourced from core, re-exported for server-internal use
export type { UserRow, TopUser, DashboardStats, RateUpdateEvent, RateLimitExceededEvent, DashboardStatsEvent, ServerEvent } from "@ratly/core";
