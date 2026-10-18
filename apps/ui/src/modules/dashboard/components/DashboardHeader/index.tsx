import { RefreshCw } from "lucide-react";
import { PageHeader } from "../../../../components/PageHeader";
import { StatusDot } from "../../../../components/StatusDot";
import { Button } from "../../../../components/Button";

interface DashboardHeaderProps {
  isConnected: boolean;
  isError: boolean;
  onRetry: () => void;
}

function DashboardHeader({ isConnected, isError, onRetry }: DashboardHeaderProps) {
  return (
    <div data-testid="dashboard-header" className="sticky top-0 z-20">
      <PageHeader
        rightSlot={
          <div
            data-testid="connection-status"
            className="flex items-center gap-3 font-mono text-sm"
          >
            {isError && (
              <div className="flex items-center gap-2">
                <span className="text-warning-text truncate hidden sm:inline">
                  Server unreachable
                </span>
                <Button variant="primary" size="icon-sm" onClick={onRetry} aria-label="Retry">
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            )}
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
                <span className="text-warning-text">
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
