import { TopUsersChart } from "../../../../components/TopUsersChart";
import type { TopUser } from "../../../../components/TopUsersChart";

const TOP_USERS_MAX = 140;

const MOCK_TOP_USERS: TopUser[] = [
  { id: "usr_2b6f84", requests: 140, max: TOP_USERS_MAX },
  { id: "usr_c02e7a", requests: 109, max: TOP_USERS_MAX },
  { id: "usr_7c21e9", requests: 100, max: TOP_USERS_MAX },
  { id: "usr_a4f02b", requests: 100, max: TOP_USERS_MAX },
  { id: "usr_3e88d1", requests: 94, max: TOP_USERS_MAX },
];

function DashboardTopUsers() {
  return (
    <TopUsersChart
      data-testid="dashboard-top-users"
      users={MOCK_TOP_USERS}
    />
  );
}

export { DashboardTopUsers };
