import type { UserRow } from "./user.js";
import type { DashboardStats } from "./stats.js";

export type RateUpdateEvent = { type: "rate:update"; row: UserRow };
export type RateLimitExceededEvent = { type: "rate:limit_exceeded"; row: UserRow };
export type DashboardStatsEvent = { type: "dashboard_stats:update"; stats: DashboardStats };
export type ServerEvent = RateUpdateEvent | RateLimitExceededEvent | DashboardStatsEvent;
