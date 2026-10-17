import type { UserRow } from "@ratly/core";
import { DashboardUsersTable } from "../DashboardUsersTable";

interface DashboardContentProps {
  rows: UserRow[];
  isLoading: boolean;
}

function DashboardContent({ rows, isLoading }: DashboardContentProps) {
  return (
    <div data-testid="dashboard-content" className="flex-1 min-h-0 flex flex-col mt-5">
      <DashboardUsersTable rows={rows} isLoading={isLoading} />
    </div>
  );
}

export { DashboardContent };
