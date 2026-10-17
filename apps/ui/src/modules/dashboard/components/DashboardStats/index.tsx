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
      sub: (
        <span className="text-success-text">
          {stats.activeUsers} active in last 15 min
        </span>
      ),
    },
    {
      label: "Rejected today",
      value: stats.rejectedToday.toLocaleString(),
      accent: "error",
    },
    {
      label: "Active users",
      value: stats.activeUsers.toLocaleString(),
      sub: `of ${stats.totalUsers} total`,
    },
  ];
}

const LOADING_ITEMS: StatItem[] = [
  { label: "Total users", value: "—" },
  { label: "Rejected today", value: "—", accent: "error" },
  { label: "Active users", value: "—" },
];

function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const items = isLoading || !stats ? LOADING_ITEMS : buildStatItems(stats);
  return <StatsRow data-testid="dashboard-stats" items={items} />;
}

export { DashboardStats };
