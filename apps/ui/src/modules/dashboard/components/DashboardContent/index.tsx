import { DashboardUsersTable } from "../DashboardUsersTable";
import { DashboardTopUsers } from "../DashboardTopUsers";
import { DashboardLiveEvents } from "../DashboardLiveEvents";

function DashboardContent() {
  return (
    <div data-testid="dashboard-content" className="mt-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Sidebar cards: right on lg, top on smaller */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 lg:order-2">
          <DashboardTopUsers />
          <DashboardLiveEvents />
        </div>

        {/* Users table: left on lg, bottom on smaller */}
        <div className="lg:order-1">
          <DashboardUsersTable />
        </div>
      </div>
    </div>
  );
}

export { DashboardContent };
