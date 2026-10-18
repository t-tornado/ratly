import type { DashboardStats as DashboardStatsData } from "@ratly/core";

import { StatsRow } from "../../../../components/StatsRow";
import { FetchStatusIndicator } from "../../../../components/FetchStatusIndicator";
import { buildDashboardStatItems, LOADING_ITEMS } from "../../utils/dashboardStats";

interface DashboardStatsProps {
  stats: DashboardStatsData | null;
  isLoading: boolean;
  isError: boolean;
}

function DashboardStats({ stats, isLoading, isError }: DashboardStatsProps) {
  const baseItems = isLoading || !stats ? LOADING_ITEMS : buildDashboardStatItems(stats);
  const indicator = !isLoading ? <FetchStatusIndicator isError={isError} /> : undefined;
  const items = baseItems.map((item) => ({ ...item, indicator }));
  return <StatsRow data-testid="dashboard-stats" items={items} />;
}

export { DashboardStats };
