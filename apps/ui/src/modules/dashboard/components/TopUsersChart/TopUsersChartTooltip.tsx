import type { TopUser } from "@ratly/core";

interface TopUsersChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TopUser }>;
}

function TopUsersChartTooltip({
  active,
  payload,
}: TopUsersChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const user = payload[0].payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-xs shadow-md">
      <p className="font-mono text-text-primary mb-1">{user.userId}</p>
      <p className="text-text-muted">
        {user.used} / {user.allowedTotal} requests
      </p>
    </div>
  );
}

export { TopUsersChartTooltip };
