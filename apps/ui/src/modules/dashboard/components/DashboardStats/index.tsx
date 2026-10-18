import { StatsRow } from "../../../../components/StatsRow";
import type { DashboardStats as DashboardStatsData } from "@ratly/core";
import { buildDashboardStatItems, LOADING_ITEMS } from "../../utils/dashboardStats";

interface DashboardStatsProps {
  stats: DashboardStatsData | null;
  isLoading: boolean;
}

function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const items = isLoading || !stats ? LOADING_ITEMS : buildDashboardStatItems(stats);
  return <StatsRow data-testid="dashboard-stats" items={items} />;
}

export { DashboardStats };
