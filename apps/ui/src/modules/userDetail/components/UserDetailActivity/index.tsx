import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { SectionHeading } from "../../../../components/SectionHeading";
import { Button } from "../../../../components/Button";
import { Select } from "../../../../components/Select";
import { ChartEmpty } from "../../../../components/ChartEmpty";
import { useActivityData } from "../../hooks/useActivityData";
import { useActivityParams } from "../../hooks/useActivityParams";
import {
  REFRESH_INTERVAL_MS,
  TICK_INTERVAL_BY_RANGE,
  formatBucketTimestamp,
} from "../../utils/activity";
import type { RefreshOption } from "../../types/activity";
import { ActivityTooltipContent } from "./ActivityTooltipContent";

const CHART_MIN_HEIGHT = 200;
const ALLOWED_COLOR = "var(--color-accent-blue)";
const REJECTED_COLOR = "var(--color-error)";

const REFRESH_OPTIONS: { value: RefreshOption; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "30s", label: "30s" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
];

interface UserDetailActivityProps {
  userId: string;
}

function UserDetailActivity({ userId }: UserDetailActivityProps) {
  const { range, refresh, setRange, setRefresh } = useActivityParams();

  const { activityBuckets, isLoading } = useActivityData({
    userId,
    range,
    refreshIntervalMs: REFRESH_INTERVAL_MS[refresh],
  });

  const tickInterval = TICK_INTERVAL_BY_RANGE[range];
  const isEmpty = !isLoading && activityBuckets.length === 0;

  return (
    <div data-testid="user-detail-activity" className="h-full">
      <section
        aria-label="Activity history"
        className="h-full flex flex-col rounded-xl border border-border-default bg-bg-surface-raised p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <SectionHeading className="mb-0">
            Activity (requests per minute)
          </SectionHeading>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              Auto-refresh
              <Select
                value={refresh}
                onChange={(e) => setRefresh(e.target.value as RefreshOption)}
                className="h-7 text-xs px-1.5"
                aria-label="Auto-refresh interval"
              >
                {REFRESH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <div
              role="group"
              aria-label="History range"
              className="flex gap-0.5"
            >
              <Button
                variant={range === "hour" ? "filter-active" : "filter"}
                size="compact"
                onClick={() => setRange("hour")}
                aria-pressed={range === "hour"}
              >
                Past hour
              </Button>
              <Button
                variant={range === "day" ? "filter-active" : "filter"}
                size="compact"
                onClick={() => setRange("day")}
                aria-pressed={range === "day"}
              >
                Past day
              </Button>
            </div>
          </div>
        </div>
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartEmpty
              message="No activity recorded"
              description="Request activity will be charted here once this user starts making requests"
            />
          </div>
        ) : isLoading && activityBuckets.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ minHeight: CHART_MIN_HEIGHT }}
          >
            <span className="text-sm text-text-muted">
              Loading activity data…
            </span>
          </div>
        ) : (
          <div
            className="flex-1 flex flex-col"
            style={{ minHeight: CHART_MIN_HEIGHT }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityBuckets}
                margin={{ top: 4, right: 0, bottom: 0, left: -16 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value: string) =>
                    formatBucketTimestamp(value, range)
                  }
                  interval={tickInterval}
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
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
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="rejected"
                  stackId="activity"
                  fill={REJECTED_COLOR}
                  radius={[1, 1, 0, 0]}
                  isAnimationActive={false}
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
          </div>
        )}
      </section>
    </div>
  );
}

export { UserDetailActivity };
export type { UserDetailActivityProps };
