import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../lib/utils";
import { DataTableRow } from "./DataTableRow";
import { EmptyState } from "../EmptyState";
import type { BadgeProps } from "../Badge";

type StatusVariant = NonNullable<BadgeProps["variant"]>;

interface UserRow {
  id: string;
  href?: string;
  remaining: number;
  total: number;
  resetTime: string;
  resetIn: string;
  status: "ok" | "warning" | "exceeded";
  statusLabel: string;
  lastRequest: string;
  tags?: { label: string; variant: StatusVariant }[];
}

interface DataTableProps extends React.ComponentProps<"div"> {
  rows: UserRow[];
  footer?: React.ReactNode;
  isLoading?: boolean;
  onAction?: (userId: string) => void;
  onRowClick?: (userId: string) => void;
}

const ROW_ESTIMATED_HEIGHT = 48;

function DataTable({ rows, footer, isLoading = false, onAction, onRowClick, className, ...props }: DataTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_ESTIMATED_HEIGHT,
  });

  const isEmpty = !isLoading && rows.length === 0;
  const virtualItems = virtualizer.getVirtualItems();
  const topSpacerHeight = virtualItems[0]?.start ?? 0;
  const bottomSpacerHeight = virtualizer.getTotalSize() - (virtualItems.at(-1)?.end ?? 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised flex flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto">
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
              <th className="py-3 px-4 font-medium">
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
                  const row = rows[virtualRow.index];
                  return (
                    <DataTableRow
                      key={row.id}
                      {...row}
                      isClickable={!!onRowClick}
                      onClick={() => onRowClick?.(row.id)}
                      onAction={() => onAction?.(row.id)}
                    />
                  );
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

export { DataTable, type DataTableProps, type UserRow };
