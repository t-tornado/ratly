/**
 * Socket.IO event names — emitted by the server gateway, consumed by UI hooks.
 *
 * @see useRowEventStore — dashboard listener for row events
 * @see useUserDetailStats — detail page listener for row events
 * @see useDashboardData — dashboard listener for stats events
 */
export const RATE_UPDATE_EVENT = "rate:update" as const;
export const RATE_LIMIT_EXCEEDED_EVENT = "rate:limit_exceeded" as const;
export const DASHBOARD_STATS_UPDATE_EVENT = "dashboard_stats:update" as const;
