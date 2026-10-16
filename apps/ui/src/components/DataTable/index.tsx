import { cn } from "../../lib/utils";
import { DataTableRow } from "./DataTableRow";
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
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)]",
        className
      )}
      {...props}
    >
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full border-collapse min-w-[860px]">
          <thead className="sticky top-0 z-10 bg-[var(--color-bg-surface-raised)]">
            <tr className="text-left text-[12px] text-[var(--color-text-muted)] uppercase tracking-[0.05em] border-b border-[var(--color-border-default)]">
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
        <div className="flex justify-between items-center px-4 py-3 text-[12px] text-[var(--color-text-muted)] border-t border-[var(--color-border-default)]">
          {footer}
        </div>
      )}
    </div>
  );
}

export { DataTable, type DataTableProps, type UserRow };
