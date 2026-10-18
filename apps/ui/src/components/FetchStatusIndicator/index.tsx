import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../Tooltip";
import { HealthyTooltipContent } from "./HealthyTooltipContent";
import { ErrorTooltipContent } from "./ErrorTooltipContent";

interface FetchStatusIndicatorProps {
  isError: boolean;
}

function FetchStatusIndicator({ isError }: FetchStatusIndicatorProps) {
  const Icon = isError ? CircleAlertIcon : CircleCheckIcon;
  const colorClass = isError ? "text-error-text" : "text-success-text";
  const label = isError ? "Fetch error" : "Live";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span role="img" aria-label={label}>
            <Icon className={`size-3.5 ${colorClass}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isError ? <ErrorTooltipContent /> : <HealthyTooltipContent />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { FetchStatusIndicator, type FetchStatusIndicatorProps };
