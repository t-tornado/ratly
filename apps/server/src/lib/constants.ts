export { DEFAULT_LIMIT } from "@ratly/core";

/** Fixed-window duration — one rate-limit cycle. */
export const WINDOW_SECONDS = 3600;

/** How often {@link EventsGateway} pushes dashboard stats to all WS clients. */
export const STATS_INTERVAL_MS = 10_000;

/** Users with a request newer than this are counted as "active". */
export const ACTIVE_WINDOW_MS = 15 * 60_000;

/** How many top consumers the dashboard stats Lua script returns. */
export const TOP_USERS_COUNT = 10;

/** Usage ratio (used/allowedTotal) at which a user's status becomes "warning". */
export const NEAR_LIMIT_THRESHOLD = 0.9;

/** TTL for the daily 429-count Redis key (2 days — keeps yesterday for the day chart). */
export const STATS_429_TTL_SECONDS = 172_800;

/** Minimum allowed pause duration for admin pause action. */
export const MIN_PAUSE_SECONDS = 60;

/** Maximum allowed pause duration for admin pause action (24 hours). */
export const MAX_PAUSE_SECONDS = 86_400;

/** Starting delay (ms) for Redis reconnection backoff. */
export const REDIS_RETRY_BASE_MS = 500;

/** Maximum delay (ms) between Redis reconnection attempts. */
export const REDIS_RETRY_CAP_MS = 30_000;
