import { FastifyRequest, FastifyReply } from "fastify";

export type RequestType = FastifyRequest;
export type ResponseType = FastifyReply;

/**
 * Result of a single rate-limit consume attempt.
 *
 * @see RateLimitService.consume — produces this from Lua output
 * @see RateLimitInterceptor — reads `allowed` to decide 429 vs pass-through
 */
export interface ConsumeResult {
  allowed: boolean;
  paused: boolean;
  used: number;
  allowedTotal: number;
  remaining: number;
  /** Epoch ms when the window resets, null if no active window. */
  resetAt: number | null;
  /** Server time (epoch ms) when the consume was evaluated. */
  now: number;
}

export interface ActivityBucket {
  /** Display time label (e.g. "14:30"). */
  time: string;
  /** Count of allowed requests in this bucket. */
  allowed: number;
  /** Count of rejected (429) requests in this bucket. */
  rejected: number;
}

export type ActivityRange = "hour" | "day";

export interface ActivityResponse {
  range: ActivityRange;
  /** Human-readable bucket duration — "1m" for hour view, "30m" for day view. */
  bucketSize: string;
  buckets: ActivityBucket[];
}

/** Shared types — sourced from core, re-exported for server-internal use. */
export type { UserRow, TopUser, DashboardStats, RateUpdateEvent, RateLimitExceededEvent, DashboardStatsEvent, ServerEvent } from "@ratly/core";
