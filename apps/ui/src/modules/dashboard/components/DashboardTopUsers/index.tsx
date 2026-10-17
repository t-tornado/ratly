import type { DashboardStats } from "@ratly/core";
import { TopUsersChart } from "../../../../components/TopUsersChart";
import type { TopUser } from "../../../../components/TopUsersChart";

interface DashboardTopUsersProps {
  stats: DashboardStats | null;
}

function mapToChartUser(topUser: DashboardStats["topUsers"][number]): TopUser {
  return {
    id: topUser.userId,
    requests: topUser.used,
    max: topUser.allowedTotal,
  };
}

function DashboardTopUsers({ stats }: DashboardTopUsersProps) {
  const chartUsers = stats ? stats.topUsers.map(mapToChartUser) : [];

  return (
    <TopUsersChart
      data-testid="dashboard-top-users"
      users={chartUsers}
    />
  );
}

export { DashboardTopUsers };
