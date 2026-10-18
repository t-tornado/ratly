import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { Socket } from "socket.io-client";
import { fetchDashboard, queryKeys } from "../../../lib/api";
import { DASHBOARD_STATS_UPDATE_EVENT } from "@ratly/core";
import type { UserRow, DashboardStats, DashboardStatsEvent } from "@ratly/core";
import type { DashboardResponse } from "../../../lib/api";

const EMPTY_ROWS: UserRow[] = [];

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
