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
  onAction?: (userId: string) => void;
  onRowClick?: (userId: string) => void;
}

function DataTable({ rows, footer, onAction, onRowClick, className, ...props }: DataTableProps) {
  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised flex flex-col",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse min-w-[860px]">
          <thead className="sticky top-0 z-10 bg-bg-surface-raised">
            <tr className="text-left text-sm text-text-muted uppercase tracking-wide border-b border-border-default">
              <th className="py-3 px-4 font-medium">User ID</th>
              <th className="py-3 px-4 font-medium">Remaining / Total</th>
              <th className="py-3 px-4 font-medium">Reset time</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Last request</th>
              <th className="py-3 px-4 font-medium w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <DataTableRow
                key={row.id}
                {...row}
                isClickable={!!onRowClick}
                onClick={() => onRowClick?.(row.id)}
                onAction={() => onAction?.(row.id)}
              />
            ))}
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
