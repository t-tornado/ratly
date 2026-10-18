import { StatsRow } from "../../../../components/StatsRow";
import type { StatItem } from "../../../../components/StatsRow";
import type { DashboardStats as DashboardStatsData } from "@ratly/core";

interface DashboardStatsProps {
  stats: DashboardStatsData | null;
  isLoading: boolean;
}

function buildStatItems(stats: DashboardStatsData): StatItem[] {
  return [
    {
      label: "Total users",
      value: stats.totalUsers.toLocaleString(),
      sub: `${stats.activeUsers} active in last 15 min`,
    },
    {
      label: "Near limit",
      value: `${stats.nearLimitPercent ?? 0}%`,
      sub: "users at 90%+ usage",
      accent: "warning",
    },
    {
      label: "Rejected today",
      value: stats.rejectedToday.toLocaleString(),
      accent: "error",
    },
  ];
}

const LOADING_ITEMS: StatItem[] = [
  { label: "Total users", value: "—" },
  { label: "Near limit", value: "0%", accent: "warning" },
  { label: "Rejected today", value: "—", accent: "error" },
];

function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const items = isLoading || !stats ? LOADING_ITEMS : buildStatItems(stats);
  return <StatsRow data-testid="dashboard-stats" items={items} />;
}

export { DashboardStats };
