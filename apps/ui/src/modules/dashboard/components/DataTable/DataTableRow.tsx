import { cn } from "../../../../lib/utils";
import { ProgressBar } from "../../../../components/ProgressBar";
import { Badge, type BadgeProps } from "../../../../components/Badge";

type StatusVariant = NonNullable<BadgeProps["variant"]>;

const STATUS_TO_BADGE: Record<string, StatusVariant> = {
  ok: "status-ok",
  warning: "status-warning",
  exceeded: "status-exceeded",
};

interface DataTableRowProps {
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
  isClickable?: boolean;
  onClick?: () => void;
  actionContent?: React.ReactNode;
  variant?: "table" | "card";
}

function DataTableRow({
  id,
  href,
  remaining,
  total,
  resetTime,
  resetIn,
  status,
  statusLabel,
  lastRequest,
  tags,
  isClickable,
  onClick,
  actionContent,
  variant = "table",
}: DataTableRowProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-4 border-b border-bg-hover",
          status === "exceeded" && "bg-error-bg shadow-inset-error",
          isClickable && "cursor-pointer hover:bg-bg-hover"
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href={href ?? "#"}
                className="font-mono text-base-sm text-accent-blue no-underline hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {id}
              </a>
              {tags?.map((tag) => (
                <Badge key={tag.label} variant={tag.variant}>
                  {tag.label}
                </Badge>
              ))}
            </div>
            <span className="font-mono text-base-sm text-text-muted">
              {resetTime} &middot; in {resetIn}
            </span>
          </div>
          {actionContent && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {actionContent}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 font-mono text-base-sm">
          <ProgressBar value={total - remaining} max={total} variant={status} />
          <span>{remaining} / {total}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={STATUS_TO_BADGE[status]}>{statusLabel}</Badge>
          <span className="text-text-muted text-base-sm">{lastRequest}</span>
        </div>
      </div>
    );
  }

  return (
    <tr
      className={cn(
        "group border-t border-bg-hover",
        status === "exceeded" &&
          "bg-error-bg shadow-inset-error",
        isClickable && "cursor-pointer hover:bg-bg-hover"
      )}
      onClick={onClick}
    >
      <td className="py-3 px-4 font-mono text-base-sm">
        <a
          href={href ?? "#"}
          className="text-accent-blue no-underline hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {id}
        </a>
        {tags?.map((tag) => (
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
        <div className="flex flex-col gap-1 font-mono text-base-sm">
          <ProgressBar
            value={total - remaining}
            max={total}
            variant={status}
          />
          <span>{remaining} / {total}</span>
        </div>
      </td>
      <td className="py-3 px-4 font-mono text-base-sm">
        <span>{resetTime}</span>
        <span className="text-text-muted ml-1">
          &middot; in {resetIn}
        </span>
      </td>
      <td className="py-3 px-4">
        <Badge variant={STATUS_TO_BADGE[status]}>
          {statusLabel}
        </Badge>
      </td>
      <td className="py-3 px-4 text-text-muted text-base-sm">
        {lastRequest}
      </td>
      <td
        className={cn(
          "py-3 px-2 sticky right-0",
          status === "exceeded" ? "bg-error-bg" : "bg-bg-surface-raised",
          isClickable && "group-hover:bg-bg-hover"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {actionContent ?? null}
      </td>
    </tr>
  );
}

export { DataTableRow, type DataTableRowProps };
