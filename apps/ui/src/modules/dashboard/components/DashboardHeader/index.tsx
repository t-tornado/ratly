import { PageHeader } from "../../../../components/PageHeader";
import { StatusDot } from "../../../../components/StatusDot";

interface DashboardHeaderProps {
  isConnected: boolean;
}

function DashboardHeader({ isConnected }: DashboardHeaderProps) {
  return (
    <div data-testid="dashboard-header">
      <PageHeader
        rightSlot={
          <div
            data-testid="connection-status"
            className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px]"
          >
            {isConnected ? (
              <>
                <StatusDot variant="live" pulsating />
                <span className="text-[var(--color-success-text)]">
                  LIVE · ws connected
                </span>
              </>
            ) : (
              <>
                <StatusDot variant="warning" />
                <span className="text-[var(--color-text-secondary)]">
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
