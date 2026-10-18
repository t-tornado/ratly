import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../../../lib/utils";
import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";
import { EmptyState } from "../../../../components/EmptyState";
import { DataTableMobile } from "./DataTableMobile";

interface DataTableProps extends React.ComponentProps<"div"> {
  userIds: string[];
  renderRow: (userId: string) => React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  mobileTitle?: string;
}

const ROW_ESTIMATED_HEIGHT = 48;
const MOBILE_BREAKPOINT = "(max-width: 639px)";

function DataTable({ userIds, renderRow, footer, isLoading = false, mobileTitle, className, ...props }: DataTableProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: userIds.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_ESTIMATED_HEIGHT,
  });

  const isEmpty = !isLoading && userIds.length === 0;

  if (isMobile) {
    return (
      <DataTableMobile
        userIds={userIds}
        renderRow={renderRow}
        footer={footer}
        isLoading={isLoading}
        mobileTitle={mobileTitle}
        className={className}
        {...props}
      />
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const topSpacerHeight = virtualItems[0]?.start ?? 0;
  const bottomSpacerHeight = virtualizer.getTotalSize() - (virtualItems.at(-1)?.end ?? 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised flex flex-col overflow-hidden ",
        className
      )}
      {...props}
    >
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto" tabIndex={0}>
        <table className="w-full border-collapse min-w-[860px] table-fixed">
          <colgroup>
            <col className="w-[340px]" />
            <col className="w-[260px]" />
            <col className="w-[220px]" />
            <col className="w-[130px]" />
            <col className="w-[160px]" />
            <col className="w-12" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-bg-surface">
            <tr className="text-left text-sm text-text-muted uppercase tracking-wide border-b border-border-default">
              <th className="py-3 px-4 font-medium">User ID</th>
              <th className="py-3 px-4 font-medium">Remaining / Total</th>
              <th className="py-3 px-4 font-medium">Reset time</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Last request</th>
              <th className="py-3 px-2 font-medium sticky right-0 z-20 bg-bg-surface">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-text-muted min-h-64">
                  Loading…
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState className="border-0 rounded-none bg-transparent" />
                </td>
              </tr>
            ) : (
              <>
                <tr style={{ height: topSpacerHeight }} />
                {virtualItems.map((virtualRow) => {
                  const userId = userIds[virtualRow.index];
                  return renderRow(userId);
                })}
                <tr style={{ height: bottomSpacerHeight }} />
              </>
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="flex justify-between items-center px-4 py-3 text-sm text-text-muted border-t border-border-default">
          {footer}
        </div>
      )}
    </div>
  );
}

export { DataTable, type DataTableProps };
