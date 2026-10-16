import { PageSection } from "../../components/PageSection";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardContent } from "./components/DashboardContent";

export default function DashboardPage() {
  const isConnected = true;

  return (
    <div data-testid="dashboard-page" className="flex flex-col h-screen">
      <DashboardHeader isConnected={isConnected} />
      <PageSection className="flex-1 min-h-0 pb-5">
        <DashboardStats />
        <DashboardContent />
      </PageSection>
    </div>
  );
}
