import { PageLayout } from "../../components/PageLayout";
import { PageSection } from "../../components/PageSection";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardContent } from "./components/DashboardContent";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // dev guard. forces new sockets after every cleanup. strict mode defense in depth
    const socket = io("http://localhost:3000", { forceNew: true });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("rate:event", (data) => {
      console.log("[Client] -> connection data", { data });
    });

    socket.on("connect_error", (err) => {
      console.log("[Client] -> Failure", { err });
      setIsConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [setIsConnected]);

  return (
    <PageLayout testId="dashboard-page">
      <DashboardHeader isConnected={isConnected} />
      <PageSection className="flex-1 min-h-0 pb-5">
        <DashboardStats />
        <DashboardContent />
      </PageSection>
    </PageLayout>
  );
}
