import { cn } from "../../lib/utils";
import { ProgressBar } from "../ProgressBar";
import { Badge, type BadgeProps } from "../Badge";
import { Button } from "../Button";

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
  onAction?: () => void;
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
  onAction,
}: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "border-t border-bg-hover",
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
      <td className="py-3 pl-2 pr-4">
        <Button
          variant="icon-only"
          size="icon"
          aria-label={`Admin actions for ${id}`}
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
        >
          &#x22EF;
        </Button>
      </td>
    </tr>
  );
}

export { DataTableRow, type DataTableRowProps };
