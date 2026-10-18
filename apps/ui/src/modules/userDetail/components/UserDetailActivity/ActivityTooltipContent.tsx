import { formatTooltipTimestamp } from "../../utils/activity";

const ALLOWED_COLOR = "var(--color-accent-blue)";
const REJECTED_COLOR = "var(--color-error)";

interface ActivityTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    payload: { timestamp: string; allowed: number; rejected: number };
  }>;
}

function ActivityTooltipContent({
  active,
  payload,
}: ActivityTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const bucket = payload[0].payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-xs shadow-md">
      <p className="font-mono text-text-primary mb-1">
        {formatTooltipTimestamp(bucket.timestamp)}
      </p>
      <p className="text-text-muted">
        <span
          className="inline-block w-2 h-2 rounded-xs mr-1.5"
          style={{ backgroundColor: ALLOWED_COLOR, opacity: 0.85 }}
        />
        Allowed: {bucket.allowed}
      </p>
      <p className="text-text-muted">
        <span
          className="inline-block w-2 h-2 rounded-xs mr-1.5"
          style={{ backgroundColor: REJECTED_COLOR }}
        />
        Rejected: {bucket.rejected}
      </p>
    </div>
  );
}

export { ActivityTooltipContent };
export type { ActivityTooltipContentProps };
