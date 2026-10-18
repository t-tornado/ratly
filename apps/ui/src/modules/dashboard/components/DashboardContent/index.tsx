import type { RowEventStore } from "../../hooks/useRowEventStore";
import { DashboardUsersTable } from "../DashboardUsersTable";

interface DashboardContentProps {
  store: RowEventStore;
  isLoading: boolean;
  isConnected: boolean;
}

function DashboardContent({ store, isLoading, isConnected }: DashboardContentProps) {
  return (
    <div data-testid="dashboard-content" className="flex flex-col mt-5">
      <DashboardUsersTable store={store} isLoading={isLoading} isConnected={isConnected} />
    </div>
  );
}

export { DashboardContent };
