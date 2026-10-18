import { BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typography } from "../Typography";

interface ChartEmptyProps {
  message?: string;
  description?: string;
  className?: string;
}

function ChartEmpty({
  message = "No activity recorded",
  description = "Data will appear here once activity is detected",
  className,
}: ChartEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center w-full h-full gap-3 text-center", className)}>
      <div className="w-10 h-10 rounded-lg bg-bg-hover flex items-center justify-center">
        <BarChart3 className="w-5 h-5 text-text-muted" />
      </div>
      <div>
        <Typography variant="label" className="font-semibold text-text-primary">{message}</Typography>
        <Typography variant="labelSm" className="text-text-muted mt-1 max-w-56">{description}</Typography>
      </div>
    </div>
  );
}

export { ChartEmpty };
export type { ChartEmptyProps };
