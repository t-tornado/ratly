import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { TopUsersChart } from "./components/TopUsersChart";
import { DashboardContent } from "./components/DashboardContent";
import { useDashboardData } from "./hooks/useDashboardData";
import { useRowEventStore } from "./hooks/useRowEventStore";
import { useSocket } from "../../lib/hooks";

export default function DashboardPage() {
  const { socket, isConnected } = useSocket();
  const { stats, initialRows, isLoading } = useDashboardData(socket);
  const store = useRowEventStore(socket, initialRows);

  return (
    <PageLayout testId="dashboard-page">
      <DashboardHeader isConnected={isConnected} />
      <PageSection className="pb-5 flex flex-col">
        <DashboardStats stats={stats} isLoading={isLoading} />
        <TopUsersChart topUsers={stats?.topUsers ?? []} />
        <DashboardContent store={store} isLoading={isLoading} />
      </PageSection>
    </PageLayout>
  );
}
