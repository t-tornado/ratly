import type { UserRow, DashboardStats } from "@ratly/core";
import type { LiveEvent } from "../../../../components/LiveEventsFeed";
import { DashboardUsersTable } from "../DashboardUsersTable";
import { DashboardTopUsers } from "../DashboardTopUsers";
import { DashboardLiveEvents } from "../DashboardLiveEvents";

interface DashboardContentProps {
  rows: UserRow[];
  stats?: DashboardStats | null;
  liveEvents: LiveEvent[];
  isLoading: boolean;
}

function DashboardContent({ rows, stats, liveEvents, isLoading }: DashboardContentProps) {
  return (
    <div data-testid="dashboard-content" className="flex-1 min-h-0 flex flex-col mt-5">
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:auto-rows-fr">
        {/* Sidebar cards: right on lg, top on smaller */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 lg:order-2 overflow-y-auto">
          <DashboardTopUsers stats={stats ?? null} />
          <DashboardLiveEvents liveEvents={liveEvents} />
        </div>

        {/* Users table: left on lg, bottom on smaller */}
        <div className="lg:order-1 min-h-0 flex flex-col">
          <DashboardUsersTable rows={rows} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export { DashboardContent };
