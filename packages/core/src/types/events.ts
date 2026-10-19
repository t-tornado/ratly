import type { UserRow } from "./user.js";
import type { DashboardStats } from "./stats.js";

/**
 * Discriminated union of all server→client WebSocket payloads.
 *
 * Each event carries a `type` literal matching its constant in
 * `constants/events.ts`. UI listeners narrow on `type` to get
 * the correct payload shape.
 *
 * @see EventsGateway — emits these via Socket.IO
 */
export type RateUpdateEvent = { type: "rate:update"; row: UserRow };
export type RateLimitExceededEvent = { type: "rate:limit_exceeded"; row: UserRow };
export type DashboardStatsEvent = { type: "dashboard_stats:update"; stats: DashboardStats };
export type ServerEvent = RateUpdateEvent | RateLimitExceededEvent | DashboardStatsEvent;
