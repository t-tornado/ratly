import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typography } from "../Typography";

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  className?: string;
}

function EmptyState({ icon: Icon, message = "No data to display.", className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full min-h-64 gap-3 rounded-xl border border-border-default bg-bg-surface-raised px-8 py-12 text-center", className)}>
      {Icon && <Icon className="size-6 text-text-muted/50" strokeWidth={1.5} />}
      <Typography variant="label" className="font-semibold text-text-primary">Nothing here</Typography>
      <Typography variant="labelSm" className="text-text-muted max-w-sm">{message}</Typography>
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
