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

export interface UserRow {
  userId: string;
  used: number;
  limit: number;
  bonus: number;
  allowedTotal: number;
  remaining: number;
  pausedCount: number;
  paused: boolean;
  pausedUntil: number | null;
  resetAt: number | null;
  status: "ok" | "warning" | "exceeded";
  lastRequestAt: number;
  at: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  rejectedToday: number;
  topUsers: TopUser[];
  at: number;
}

export interface TopUser {
  userId: string;
  used: number;
  allowedTotal: number;
  ratio: number;
}

export type RateUpdateEvent = { type: "rate:update"; row: UserRow };
export type RateLimitExceededEvent = { type: "rate:limit_exceeded"; row: UserRow };
export type DashboardStatsEvent = { type: "dashboard_stats:update"; stats: DashboardStats };
export type ServerEvent = RateUpdateEvent | RateLimitExceededEvent | DashboardStatsEvent;
