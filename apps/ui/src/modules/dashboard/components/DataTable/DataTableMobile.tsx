import { Users, WifiOff } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { EmptyState } from "../../../../components/EmptyState";

const DISCONNECTED_MESSAGE = "Connection to server lost. Data shown may be stale.";

interface DataTableMobileProps extends React.ComponentProps<"div"> {
  userIds: string[];
  renderRow: (userId: string) => React.ReactNode;
  footer?: React.ReactNode;
  isLoading: boolean;
  isDisconnected?: boolean;
  mobileTitle?: string;
}

function DataTableMobile({
  userIds,
  renderRow,
  footer,
  isLoading,
  isDisconnected = false,
  mobileTitle,
  className,
  ...props
}: DataTableMobileProps) {
  const isEmpty = !isLoading && userIds.length === 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised flex flex-col overflow-hidden min-h-[400px]",
        className
      )}
      {...props}
    >
      {mobileTitle && (
        <div className="px-4 py-3 text-sm text-text-muted uppercase tracking-wide border-b border-border-default font-medium">
          {mobileTitle}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto" tabIndex={0}>
        {isLoading ? (
          <div className="py-16 text-center text-sm text-text-muted">Loading…</div>
        ) : isDisconnected ? (
          <EmptyState
            icon={WifiOff}
            variant="warning"
            message={DISCONNECTED_MESSAGE}
            className="border-0 rounded-none bg-transparent"
          />
        ) : isEmpty ? (
          <EmptyState icon={Users} className="border-0 rounded-none bg-transparent" />
        ) : (
          userIds.map((userId) => (
            <div key={userId}>{renderRow(userId)}</div>
          ))
        )}
      </div>
      {footer && (
        <div className="flex justify-between items-center px-4 py-3 text-sm text-text-muted border-t border-border-default">
          {footer}
        </div>
      )}
    </div>
  );
}

export { DataTableMobile };
export type { DataTableMobileProps };
