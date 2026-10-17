import { Button } from "../Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 rounded-xl border border-error-border bg-error-surface px-8 py-12 text-center">
      <p className="text-base font-semibold text-error-text">Error</p>
      <p className="text-sm text-text-secondary max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
