import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";
import { Button } from "../Button";
import { Select } from "../Select";

type RefreshOption = "off" | "30s" | "1m" | "5m";

interface ActivityChartProps extends React.ComponentProps<"section"> {
  title?: string;
  activeRange?: "hour" | "day";
  onRangeChange?: (range: "hour" | "day") => void;
  activeRefresh?: RefreshOption;
  onRefreshChange?: (option: RefreshOption) => void;
  children?: React.ReactNode;
}

const REFRESH_OPTIONS: { value: RefreshOption; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "30s", label: "30s" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
];

function ActivityChart({
  title = "Activity · requests per minute",
  activeRange = "hour",
  onRangeChange,
  activeRefresh = "off",
  onRefreshChange,
  children,
  className,
  ...props
}: ActivityChartProps) {
  return (
    <section
      aria-label="Activity history"
      className={cn(
        "rounded-xl border border-border-default bg-bg-surface-raised p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <SectionHeading className="mb-0">{title}</SectionHeading>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-text-muted">
            Auto-refresh
            <Select
              value={activeRefresh}
              onChange={(e) =>
                onRefreshChange?.(e.target.value as RefreshOption)
              }
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
              variant={activeRange === "hour" ? "filter-active" : "filter"}
              size="compact"
              onClick={() => onRangeChange?.("hour")}
              aria-pressed={activeRange === "hour"}
            >
              Past hour
            </Button>
            <Button
              variant={activeRange === "day" ? "filter-active" : "filter"}
              size="compact"
              onClick={() => onRangeChange?.("day")}
              aria-pressed={activeRange === "day"}
            >
              Past day
            </Button>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export { ActivityChart };
export type { ActivityChartProps, RefreshOption };
