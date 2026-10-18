import { PageHeader } from "../../../../components/PageHeader";
import { StatusDot } from "../../../../components/StatusDot";

interface DashboardHeaderProps {
  isConnected: boolean;
}

function DashboardHeader({ isConnected }: DashboardHeaderProps) {
  return (
    <div data-testid="dashboard-header" className="sticky top-0 z-20">
      <PageHeader
        rightSlot={
          <div
            data-testid="connection-status"
            className="flex items-center gap-2 font-mono text-sm"
          >
            {isConnected ? (
              <>
                <StatusDot variant="live" pulsating />
                <span className="text-success-text">
                  LIVE · ws connected
                </span>
              </>
            ) : (
              <>
                <StatusDot variant="warning" />
                <span className="text-text-secondary">
                  disconnected
                </span>
              </>
            )}
          </div>
        }
      />
    </div>
  );
}

export { DashboardHeader, type DashboardHeaderProps };
