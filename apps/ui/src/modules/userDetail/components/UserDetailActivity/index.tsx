import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ActivityChart } from "../../../../components/ActivityChart";
import type { RefreshOption } from "../../../../components/ActivityChart";
import { useActivityData } from "../../hooks/useActivityData";
import type { ActivityRange } from "../../types/activity";
import {
  REFRESH_INTERVAL_MS,
  TICK_INTERVAL_BY_RANGE,
  formatBucketTimestamp,
  formatTooltipTimestamp,
} from "../../utils/activity";
import { UserDetailActivityEmpty } from "../UserDetailActivityEmpty";

const CHART_HEIGHT = 200;
const ALLOWED_COLOR = "var(--color-accent-blue)";
const REJECTED_COLOR = "var(--color-error)";

interface UserDetailActivityProps {
  userId: string;
}

function ActivityTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { timestamp: string; allowed: number; rejected: number } }>;
}) {
  if (!active || !payload?.length) return null;

  const bucket = payload[0].payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-xs shadow-md">
      <p className="font-mono text-text-primary mb-1">
        {formatTooltipTimestamp(bucket.timestamp)}
      </p>
      <p className="text-text-muted">
        <span className="inline-block w-2 h-2 rounded-xs mr-1.5" style={{ backgroundColor: ALLOWED_COLOR, opacity: 0.85 }} />
        Allowed: {bucket.allowed}
      </p>
      <p className="text-text-muted">
        <span className="inline-block w-2 h-2 rounded-xs mr-1.5" style={{ backgroundColor: REJECTED_COLOR }} />
        Rejected: {bucket.rejected}
      </p>
    </div>
  );
}

function UserDetailActivity({ userId }: UserDetailActivityProps) {
  const [activeRange, setActiveRange] = useState<ActivityRange>("hour");
  const [activeRefresh, setActiveRefresh] = useState<RefreshOption>("off");

  const { activityBuckets, isLoading } = useActivityData({
    userId,
    range: activeRange,
    refreshIntervalMs: REFRESH_INTERVAL_MS[activeRefresh],
  });

  const handleRangeChange = useCallback((range: ActivityRange) => {
    setActiveRange(range);
  }, []);

  const handleRefreshChange = useCallback((option: RefreshOption) => {
    setActiveRefresh(option);
  }, []);

  const tickInterval = TICK_INTERVAL_BY_RANGE[activeRange];
  const isEmpty = !isLoading && activityBuckets.length === 0;

  return (
    <div data-testid="user-detail-activity" className="h-full">
      <ActivityChart
        className="h-full flex flex-col"
        title="Activity · requests per minute"
        activeRange={activeRange}
        onRangeChange={handleRangeChange}
        activeRefresh={activeRefresh}
        onRefreshChange={handleRefreshChange}
      >
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <UserDetailActivityEmpty />
          </div>
        ) : isLoading && activityBuckets.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT }}>
            <span className="text-sm text-text-muted">Loading activity data…</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart
                data={activityBuckets}
                margin={{ top: 4, right: 0, bottom: 0, left: -16 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value: string) =>
                    formatBucketTimestamp(value, activeRange)
                  }
                  interval={tickInterval}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "var(--color-border-strong)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ActivityTooltipContent />}
                  cursor={{ fill: "var(--color-bg-hover)", opacity: 0.5 }}
                />
                <Bar
                  dataKey="allowed"
                  stackId="activity"
                  fill={ALLOWED_COLOR}
                  opacity={0.85}
                  radius={[1, 1, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  stackId="activity"
                  fill={REJECTED_COLOR}
                  radius={[1, 1, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-xs bg-accent-blue opacity-85" />
                Allowed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-xs bg-error" />
                Rejected
              </span>
            </div>
          </>
        )}
      </ActivityChart>
    </div>
  );
}

export { UserDetailActivity };
export type { UserDetailActivityProps };
