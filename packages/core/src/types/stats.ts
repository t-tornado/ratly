import type { TopUser } from "./user.js";

/**
 * Aggregate dashboard metrics computed atomically by Lua.
 *
 * @see DashboardStatsService.getStats — server-side producer
 * @see useDashboardData — client-side consumer via REST + socket
 */
export interface DashboardStats {
  totalUsers: number;
  /** Users with a request in the last {@link ACTIVE_WINDOW_MS}. */
  activeUsers: number;
  /** Total 429 responses today (UTC calendar day). */
  rejectedToday: number;
  /** Percentage of users at ≥ {@link NEAR_LIMIT_THRESHOLD} usage ratio. */
  nearLimitPercent: number;
  topUsers: TopUser[];
  /** Server timestamp (epoch ms) when computed. */
  at: number;
}
