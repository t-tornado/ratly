import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { Socket } from "socket.io-client";
import { fetchDashboard, queryKeys } from "../../../lib/api";
import { DASHBOARD_STATS_UPDATE_EVENT } from "@ratly/core";
import type { UserRow, DashboardStats, DashboardStatsEvent } from "@ratly/core";
import type { DashboardResponse } from "../../../lib/api";

const EMPTY_ROWS: UserRow[] = [];

/**
 * REST bootstrap + live stats for the dashboard.
 *
 * Fetches the initial dashboard payload (rows + stats), then
 * keeps stats current via `dashboard_stats:update` socket events.
 * Rows are handed off to {@link useRowEventStore} for per-row
 * pub/sub — this hook does not manage row updates.
 *
 * @param socket - Shared Socket.IO instance from {@link SocketProvider}
 * @returns Initial rows (seed for {@link useRowEventStore}), live stats, loading state
 * @listens socket "dashboard_stats:update" — replaces stats in query cache
 * @see useRowEventStore — takes `initialRows` and owns row-level updates
 */
function useDashboardData(socket: Socket) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
  });

  const initialRows = useMemo(() => data?.rows ?? EMPTY_ROWS, [data?.rows]);

  const updateStats = useCallback((stats: DashboardStats) => {
    queryClient.setQueryData<DashboardResponse>(queryKeys.dashboard, (old) => {
      if (!old) return old;
      return { ...old, stats };
    });
  }, [queryClient]);

  useEffect(() => {
    const handleDashboardStats = ({ stats: dashboardStats }: DashboardStatsEvent) => {
      updateStats(dashboardStats);
    };

    socket.on(DASHBOARD_STATS_UPDATE_EVENT, handleDashboardStats);

    return () => {
      socket.off(DASHBOARD_STATS_UPDATE_EVENT, handleDashboardStats);
    };
  }, [socket, updateStats]);

  return {
    stats: data?.stats ?? null,
    initialRows,
    isLoading,
    isError,
    refetch,
  };
}

export { useDashboardData };
