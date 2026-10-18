import type { RowEventStore } from "../../hooks/useRowEventStore";
import { DashboardUsersTable } from "../DashboardUsersTable";

interface DashboardContentProps {
  store: RowEventStore;
  isLoading: boolean;
}

function DashboardContent({ store, isLoading }: DashboardContentProps) {
  return (
    <div data-testid="dashboard-content" className="sm:flex-1 sm:min-h-0 flex flex-col mt-5">
      <DashboardUsersTable store={store} isLoading={isLoading} />
    </div>
  );
}

export { DashboardContent };
