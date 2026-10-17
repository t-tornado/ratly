import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchDashboard, queryKeys } from "../../../lib/api";
import type { UserRow, DashboardStats } from "@ratly/core";
import type { DashboardResponse } from "../../../lib/api";

function useDashboardData() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
  });

  const updateSingleRow = useCallback((row: UserRow) => {
    queryClient.setQueryData<DashboardResponse>(queryKeys.dashboard, (old) => {
      if (!old) return old;
      const existingIndex = old.rows.findIndex((r) => r.userId === row.userId);
      if (existingIndex >= 0) {
        const updatedRows = old.rows.slice();
        updatedRows[existingIndex] = row;
        return { ...old, rows: updatedRows };
      }
      return { ...old, rows: [row, ...old.rows] };
    });
  }, [queryClient]);

  const updateStats = useCallback((stats: DashboardStats) => {
    queryClient.setQueryData<DashboardResponse>(queryKeys.dashboard, (old) => {
      if (!old) return old;
      return { ...old, stats };
    });
  }, [queryClient]);

  return {
    stats: data?.stats ?? null,
    rows: data?.rows ?? [],
    isLoading,
    isError,
    updateSingleRow,
    updateStats,
  };
}

export { useDashboardData };
