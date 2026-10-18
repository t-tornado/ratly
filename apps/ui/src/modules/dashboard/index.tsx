import { useEffect } from "react";
import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardContent } from "./components/DashboardContent";
import { useDashboardData } from "./hooks/useDashboardData";
import { useSocket } from "../../lib/hooks";
import { RATE_UPDATE_EVENT, RATE_LIMIT_EXCEEDED_EVENT, DASHBOARD_STATS_UPDATE_EVENT } from "@ratly/core";
import type { RateUpdateEvent, RateLimitExceededEvent, DashboardStatsEvent } from "@ratly/core";

export default function DashboardPage() {
  const { stats, rows, isLoading, updateSingleRow, updateStats } = useDashboardData();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const handleRateUpdate = ({ row }: RateUpdateEvent) => {
      updateSingleRow(row);
    };

    const handleLimitExceeded = ({ row }: RateLimitExceededEvent) => {
      updateSingleRow(row);
    };

    const handleDashboardStats = ({ stats: dashboardStats }: DashboardStatsEvent) => {
      updateStats(dashboardStats);
    };

    socket.on(RATE_UPDATE_EVENT, handleRateUpdate);
    socket.on(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
    socket.on(DASHBOARD_STATS_UPDATE_EVENT, handleDashboardStats);

    return () => {
      socket.off(RATE_UPDATE_EVENT, handleRateUpdate);
      socket.off(RATE_LIMIT_EXCEEDED_EVENT, handleLimitExceeded);
      socket.off(DASHBOARD_STATS_UPDATE_EVENT, handleDashboardStats);
    };
  }, [socket, updateSingleRow, updateStats]);

  return (
    <PageLayout testId="dashboard-page">
      <DashboardHeader isConnected={isConnected} />
      <PageSection className="sm:flex-1 sm:min-h-0 pb-5 flex flex-col sm:overflow-hidden">
        <DashboardStats stats={stats} isLoading={isLoading} />
        <DashboardContent rows={rows} isLoading={isLoading} />
      </PageSection>
    </PageLayout>
  );
}
