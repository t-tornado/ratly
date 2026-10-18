import { AlertTriangle } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Try again or reload the page.",
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full min-h-64 gap-5 rounded-xl border border-error-border bg-error-surface px-8 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-error-bg">
        <AlertTriangle className="size-5 text-error-text" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-text-primary">{title}</p>
        <p className="text-sm text-text-muted max-w-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
