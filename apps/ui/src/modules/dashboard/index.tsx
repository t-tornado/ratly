import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
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
      <PageSection className="sm:flex-1 sm:min-h-0 pb-5 flex flex-col sm:overflow-hidden">
        <DashboardStats stats={stats} isLoading={isLoading} />
        <DashboardContent store={store} isLoading={isLoading} />
      </PageSection>
    </PageLayout>
  );
}
