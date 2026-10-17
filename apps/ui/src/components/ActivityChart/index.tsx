import { cn } from "../../lib/utils";
import { SectionHeading } from "../SectionHeading";
import { Button } from "../Button";

interface ActivityChartProps extends React.ComponentProps<"section"> {
  title?: string;
  activeRange?: "hour" | "day";
  onRangeChange?: (range: "hour" | "day") => void;
  children?: React.ReactNode;
}

function ActivityChart({
  title = "Activity · requests per minute",
  activeRange = "hour",
  onRangeChange,
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
        <div role="group" aria-label="History range" className="flex gap-0.5">
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
      {children}
    </section>
  );
}

export { ActivityChart };
