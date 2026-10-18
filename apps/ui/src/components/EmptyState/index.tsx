import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typography } from "../Typography";

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  variant?: "default" | "warning";
  className?: string;
}

const ICON_COLOR = {
  default: "text-text-muted/50",
  warning: "text-warning-text",
} as const;

const TITLE_COLOR = {
  default: "text-text-primary",
  warning: "text-warning-text",
} as const;

function EmptyState({ icon: Icon, message = "No data to display.", variant = "default", className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full min-h-64 gap-3 rounded-xl border border-border-default bg-bg-surface-raised px-8 py-12 text-center", className)}>
      {Icon && <Icon className={cn("size-6", ICON_COLOR[variant])} strokeWidth={1.5} />}
      <Typography variant="label" className={cn("font-semibold", TITLE_COLOR[variant])}>Nothing here</Typography>
      <Typography variant="labelSm" className="text-text-muted max-w-sm">{message}</Typography>
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
