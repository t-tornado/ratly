import { DashboardHeader } from "./components/DashboardHeader";

export default function DashboardPage() {
  const isConnected = true;

  return (
    <div data-testid="dashboard-page">
      <DashboardHeader isConnected={isConnected} />
      <main data-testid="dashboard-content" />
    </div>
  );
}
