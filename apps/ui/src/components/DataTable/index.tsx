import { cn } from "../../lib/utils";
import { ProgressBar } from "../ProgressBar";
import { Badge, type BadgeProps } from "../Badge";
import { Button } from "../Button";

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
}

const statusToBadge: Record<string, StatusVariant> = {
  ok: "status-ok",
  warning: "status-warning",
  exceeded: "status-exceeded",
};

function DataTable({ rows, footer, onAction, className, ...props }: DataTableProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-raised)]",
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[860px]">
          <thead>
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
              <tr
                key={row.id}
                className={cn(
                  "border-t border-[var(--color-bg-hover)]",
                  row.status === "exceeded" &&
                    "bg-[var(--color-error-bg)] shadow-[var(--shadow-inset-error)]"
                )}
              >
                <td className="py-3 px-4 font-[family-name:var(--font-mono)] text-[13px]">
                  <a
                    href={row.href ?? "#"}
                    className="text-[var(--color-accent-blue)] no-underline hover:underline"
                  >
                    {row.id}
                  </a>
                  {row.tags?.map((tag) => (
                    <Badge
                      key={tag.label}
                      variant={tag.variant}
                      className="ml-1.5"
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[13px]">
                    <span className="w-16 text-right">
                      {row.remaining} / {row.total}
                    </span>
                    <ProgressBar
                      value={row.total - row.remaining}
                      max={row.total}
                      variant={row.status}
                      className="w-24"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-mono)] text-[13px]">
                  <span>{row.resetTime}</span>
                  <span className="text-[var(--color-text-muted)] ml-1">
                    · in {row.resetIn}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusToBadge[row.status]}>
                    {row.statusLabel}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-[var(--color-text-muted)] text-[13px]">
                  {row.lastRequest}
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="icon-only"
                    size="icon"
                    aria-label={`Admin actions for ${row.id}`}
                    onClick={() => onAction?.(row.id)}
                  >
                    ⋯
                  </Button>
                </td>
              </tr>
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

export { DataTable };
