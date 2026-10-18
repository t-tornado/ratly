import type { StatItem } from "../../../components/StatsRow";
import type { DashboardStats } from "@ratly/core";

const LOADING_ITEMS: StatItem[] = [
  { label: "Total users", value: "—" },
  { label: "Near limit", value: "0%", accent: "warning" },
  { label: "Rejected today", value: "—", accent: "error" },
];

function buildDashboardStatItems(stats: DashboardStats): StatItem[] {
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

export { buildDashboardStatItems, LOADING_ITEMS };
