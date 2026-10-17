import { StatsRow } from "../../../../components/StatsRow";
import type { StatItem } from "../../../../components/StatsRow";

const DASHBOARD_STATS: StatItem[] = [
  {
    label: "Total users",
    value: "1,284",
    sub: (
      <span className="text-success-text">
        312 active in last 15 min
      </span>
    ),
  },
  {
    label: "Near limit (\u2265 90%)",
    value: "4.7%",
    sub: "61 users \u00b7 9 of them exceeded",
    accent: "warning",
  },
  {
    label: "429s today",
    value: "14",
    sub: "last at 13:02:11",
    accent: "error",
  },
];

function DashboardStats() {
  return <StatsRow data-testid="dashboard-stats" items={DASHBOARD_STATS} />;
}

export { DashboardStats };
